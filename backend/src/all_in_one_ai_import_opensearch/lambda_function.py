import json
import os
import boto3
from elasticsearch import Elasticsearch
import traceback

lambda_client = boto3.client('lambda')
s3_client = boto3.resource('s3')


def lambda_handler(event, context):
    print(event)

    if 'queryStringParameters' in event.keys():
        try:
            industrial_model = event['queryStringParameters']['industrial_model']
            index = industrial_model
            endpoint = os.environ['ES_ENDPOINT']
            es = Elasticsearch(endpoint)

            _ENDPOINT_INFERENCE = 'endpoint_name' in event['queryStringParameters']

            action = None
            if 'action' in event['queryStringParameters']:
                action = event['queryStringParameters']['action']
            if action == 'query':
                if _ENDPOINT_INFERENCE:  # via SQS
                    if es.indices.exists(index=index):
                        count = es.count(index=index, )['count']
                    else:
                        count = 0

                    return {
                        'statusCode': 200,
                        'body': json.dumps(
                            {
                                'current': count
                            }
                        )
                    }
                else:
                    # count if document has nothing in "_source"
                    if es.indices.exists(index=index):
                        total_count = es.count(index=index, )['count']

                        missing_count = es.search(index=index,
                                                  track_total_hits="true",
                                                  body={
                                                      "query": {
                                                          "bool": {
                                                              "must_not": {
                                                                  "exists": {
                                                                      "field": "img_vector"
                                                                  }
                                                              }
                                                          }
                                                      }
                                                  })["hits"]["total"]["value"]

                        return {
                            'statusCode': 200,
                            'body': json.dumps(
                                {
                                    'current': total_count,
                                    'progress': (1 - round(missing_count / total_count)) * 100
                                }
                            )
                        }

            # For Index management (Create, Import)
            create_index(es, index)

            if _ENDPOINT_INFERENCE:  # via SQS
                # for src/components/Forms/ImportImage/index.tsx (call Endpoint for inference)
                endpoint_name = event['queryStringParameters']['endpoint_name']
                model_samples = event['queryStringParameters']['model_samples']

                request = {
                    'industrial_model': industrial_model,
                    'model_samples': model_samples,
                    'endpoint_name': endpoint_name
                }

                response = lambda_client.invoke(
                    FunctionName='all_in_one_ai_import_opensearch_handler',
                    InvocationType='Event',
                    Payload=json.dumps({'body': request})
                )

                return {
                    'statusCode': response['StatusCode'],
                    'body': response['Payload'].read().decode('utf-8')
                }

        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }

    else:
        # call from create_bucket_event_notification
        industrial_model = event['body']['industrial_model']
        index = industrial_model
        endpoint = os.environ['ES_ENDPOINT']
        es = Elasticsearch(endpoint)
        create_index(es, index)


def create_index(es, index):
    if es.indices.exists(index=index):
        es.indices.delete(index=index)

    knn_index = {
        "settings": {
            "index.knn": True
        },
        "mappings": {
            "properties": {
                "img_vector": {
                    "type": "knn_vector",
                    "dimension": 2048
                },
                "img_s3uri": {
                    "type": "keyword",
                    "index": "true"
                },
                "index_key": {
                    "type": "text"
                }
            }
        }
    }

    es.indices.create(index=index, body=knn_index, ignore=400)
    print(es.indices.get(index=index))
    print(f"Create Index[{index}] successfully")
    idx_list = es.cat.indices(index='*', h='index', s='index:desc').split()
    print(f"all indexes: {idx_list}")
