import json
import os
import helper
import boto3
from elasticsearch import Elasticsearch
import traceback

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    try:
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
                query = {
                    "query": {
                        "match_all": {}
                        }
                    }
                count = es.count(index = index, body = query)['count']
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

        request = {
            'industrial_model': industrial_model,
            'model_samples': model_samples
        }

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_import_opensearch_handler',
            InvocationType = 'Event',
            Payload=json.dumps({'body' : request})
        )
            
        return {
            'statusCode': response['statusCode'],
            'body': response['Payload'].read().decode('utf-8')
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
                }
            }
        }
    }
    es.indices.create(index = index, body = knn_index, ignore = 400)
    print(es.indices.get(index = index))