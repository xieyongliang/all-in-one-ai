import json
import os
import helper
import boto3
from elasticsearch import Elasticsearch
import traceback

index = 'annotation'
endpoint = os.environ['ES_ENDPOINT']
es = Elasticsearch(endpoint)

def lambda_handler(event, context):
    print(event)

    if not es.indices.exists(index = index):
        create_index(es, index)

    if event['httpMethod'] == 'POST':
        try:
            payload = json.loads(event['body'])
            bucket = payload['bucket']
            key = payload['key']
            data = payload['data']

            query = {  # TODO Would speed up by reduce the result fields
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"bucket": bucket}},
                            {"match": {"key": key}}
                        ]
                    }
                }
            }

            response = es.search(
                index = index,
                body = query
            )

            if(len(response['hits']['hits']) == 0):
                response = es.index(
                    index = index,
                    body = {
                        "bucket": bucket, 
                        "key": key,
                        "data": data
                    }
                )
            else:
                response = es.update(
                    index = index,
                    id = response['hits']['hits'][0]['_id'],
                    body = {
                        "doc": {
                            "data": data
                        }
                    },
                    doc_type="_doc"
                )

            return {
                'statusCode': 200,
                'body': json.dumps(response)
            }
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }    
    elif event['httpMethod'] == 'GET':
        try:
            bucket = event['queryStringParameters']['bucket']
            key = event['queryStringParameters']['key']

            query = {  # TODO Would speed up by reduce the result fields
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"bucket": bucket}},
                            {"match": {"key": key}}
                        ]
                    }
                }
            }

            response = es.search(
                index = index,
                body = query
            )
            body = {}

            if(len(response['hits']['hits']) > 0):
                body = response['hits']['hits'][0]['_source']
            
            return {
                'statusCode': 200,
                'body': json.dumps(body)
            }
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
    elif event['httpMethod'] == 'DELETE':
        try:
            bucket = event['queryStringParameters']['bucket']
            key = event['queryStringParameters']['key']
            
            query = {  # TODO Would speed up by reduce the result fields
                "query": {
                    "bool": {
                        "must": [
                            {"match": {"bucket": bucket}},
                            {"match": {"key": key}}
                        ]
                    }
                }
            }            
            
            response = es.delete_by_query(
                index = index, 
                doc_type = '_doc', 
                body = query
            )

            return {
                'statusCode': 200,
                'body': json.dumps(response)
            }
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 200,
                'body': str(e)
            }
    else:
        return {
            'statusCode': 400,
            'body': 'Unsupported HTTP method'
        }

def create_index(es, index):    
    body = {
        "mappings": {
            "properties": {
                "bucket": {"type": "keyword", "index": "true"},
                "key": {"type": "keyword", "index": "true"},
                "data": {"type": "keyword"}           
            }
        },
    }
    es.indices.create(index = index, body = body, ignore = 400)
    print(es.indices.get(index = index))