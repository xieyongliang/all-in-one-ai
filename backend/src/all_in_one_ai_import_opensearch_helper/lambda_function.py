import json
import os
import helper
import boto3
from botocore.exceptions import ClientError
from elasticsearch import Elasticsearch

sqs = boto3.resource('sqs')
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    endpoint = os.environ['ES_ENDPOINT']
    es = Elasticsearch(endpoint)
    messages_to_reprocess = []
    batch_failure_response = {}
    
    for record in event['Records']:
        payload = json.loads(record["body"])
        s3uri = payload['s3uri']
        index = payload['index']
        bucket, key = get_bucket_and_key(s3uri)
        content_type = 'application/json'
        endpoint_name = 'track-search-by-image'
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
            statusCode = response['StatusCode']
            body = response["Payload"].read().decode("utf-8")
            if(statusCode == 200):
                payload = json.loads(body)
                prediction = payload['predictions'][0]
                response = es.index(
                    index = index,
                    body = {
                        "img_vector": prediction, 
                        "image": s3uri
                    }
                )
            else:
                messages_to_reprocess.append({"itemIdentifier": record['messageId']})
        else:
            messages_to_reprocess.append({"itemIdentifier": record['messageId']})
            
    query = {
        "query": {
            "match_all": {}
        }
    }
    count = es.count(index=index, body = query)['count']
    print('ES index - {0} has {1} items'.format(index, count))

    batch_failure_response["batchItemFailures"] = messages_to_reprocess
    return batch_failure_response
    
def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key