import json
import os
import boto3
from elasticsearch import Elasticsearch
import traceback

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    try:
        if event['httpMethod'] == 'GET':
            industrial_model = event['queryStringParameters']['industrial_model']
            model_samples = event['queryStringParameters']['model_samples']

            index = industrial_model
            endpoint = os.environ['ES_ENDPOINT']
            es = Elasticsearch(endpoint)

            action = None
            if('action' in event['queryStringParameters']):
                action = event['queryStringParameters']['action']
            if(action == 'query'):
                if es.indices.exists(index = index):
                    count = es.count(index = index,)['count']
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

            create_index(es, index)

            endpoint_name = event['queryStringParameters']['endpoint_name']

            request = {
                'industrial_model': industrial_model,
                'model_samples': model_samples,
                'endpoint_name': endpoint_name
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_import_opensearch_sync',
                InvocationType = 'Event',
                Payload=json.dumps({'body' : request})
            )
        
            return {
                'statusCode': response['StatusCode'],
                'body': response['Payload'].read().decode('utf-8')
            }
        elif event['httpMethod'] == 'POST':
            industrial_model = event['body']['industrial_model']
            index = industrial_model
            endpoint = os.environ['ES_ENDPOINT']
            es = Elasticsearch(endpoint)

            create_index(es, index)
            
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_import_opensearch_async',
                InvocationType = 'Event',
                Payload=json.dumps({'body' : event['body']})
            )
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP method'
            }

    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
    
def create_index(es, index):
    if es.indices.exists(index = index):
        es.indices.delete(index = index)

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
                 }
            }
        }
    }

    es.indices.create(index = index, body = knn_index, ignore = 400)
    print(es.indices.get(index = index))
    