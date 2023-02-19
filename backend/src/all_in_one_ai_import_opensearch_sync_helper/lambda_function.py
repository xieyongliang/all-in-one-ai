import json
import os
import boto3
from elasticsearch import Elasticsearch

sqs = boto3.resource('sqs')
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    endpoint = os.environ['ES_ENDPOINT']
    es = Elasticsearch(endpoint)
    messages_to_reprocess = []
    batch_failure_response = {}
    
    print('num_of_records:', len(event['Records']))
    
    for record in event['Records']:
        payload = json.loads(record["body"])
        print(payload)
        s3uri = payload['s3uri']
        index = payload['index']
        endpoint_name = payload['endpoint_name']
        
        query = {
            "query": {
                "match": {
                    "img_s3uri": s3uri
                }
            }
        }
        
        response = es.search(
            index = index,
            body = query
        )
        
        if(len(response['hits']['hits']) > 0):
            continue
        
        bucket, key = get_bucket_and_key(s3uri)
        content_type = 'application/json'
        payload = {
            'bucket' : bucket, 
            'image_uri' : key,
            'content_type': content_type
        }
        body = {
            'endpoint_name': endpoint_name,
            'content_type': content_type,
            'payload': json.dumps(payload),
        }
        
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_invoke_endpoint',
            InvocationType = 'RequestResponse',
            Payload = json.dumps(body)
        )
        
        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            print(payload)
            statusCode = payload['statusCode']
            if(statusCode == 200):
                prediction = json.loads(payload['body'])['result']
                response = es.index(
                    index = index,
                    body = {
                        "img_vector": prediction, 
                        "img_s3uri": s3uri
                    }
                )
                print(response)
            else:
                messages_to_reprocess.append({"itemIdentifier": record['messageId']})
        else:
            messages_to_reprocess.append({"itemIdentifier": record['messageId']})
    
    es.indices.refresh(index = index)
    count = es.count(index = index)['count']
    print('vector count', count)
    print(es.indices.get(index = index))
    
    batch_failure_response["batchItemFailures"] = messages_to_reprocess
    print(messages_to_reprocess)
    return batch_failure_response
    
def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
