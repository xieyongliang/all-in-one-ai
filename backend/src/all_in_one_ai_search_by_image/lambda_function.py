import json
import boto3
import base64
import os
import helper
from botocore.exceptions import ClientError
from elasticsearch import Elasticsearch

lambda_client = boto3.client('lambda')
s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))

def lambda_handler(event, context):
    print(event)
    industrial_model = event['queryStringParameters']['industrial_model']

    index = industrial_model
    endpoint = os.environ['ES_ENDPOINT']
    es = Elasticsearch(endpoint)

    if event['httpMethod'] == 'POST':
        payload = event['body']

        print(event['headers'])
        print(event['queryStringParameters'])
        
        k_neighbors = 3
        if('k_neighbors' in event['queryStringParameters']):
            k_neighbors = event['queryStringParameters']['k_neighbors']

        if('Content-Type' in event['headers']):
            content_type = event['headers']['Content-Type']
        elif('content-type' in event['headers']):
            content_type = event['headers']['content-type']
        else:
            content_type = None

        endpoint_name = event['queryStringParameters']['endpoint_name']

        body = {
            "endpoint_name": endpoint_name,
            "content_type": content_type,
            "payload": payload
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
                payload = json.loads(payload['body'])
                prediction = payload['predictions'][0]
                print(prediction)
                response = es.search(
                    request_timeout=30, index=index,
                    body={
                        'size': k_neighbors,
                        'query': {'knn': {'img_vector': {'vector': prediction, 'k': k_neighbors}}}}
                    )
                print(response)
                s3uris = [response['hits']['hits'][x]['_source']['image'] for x in range(k_neighbors)]
                httpuris = []
                for s3uri in s3uris:
                    bucket, key = get_bucket_and_key(s3uri)
                    httpuri = get_presigned_url(bucket, key)
                    httpuris.append(httpuri)
            return {
                'statusCode': 200,
                'body': json.dumps(httpuris)
            }
        else:
            return {
                'statusCode': 400,
                'body': response["FunctionError"]
            }
        
    else:
        return {
            'statusCode': 400,
            'body': "Unsupported HTTP method"
        }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
    
def get_presigned_url(bucket, key):
    try:
        url = s3_client.generate_presigned_url(
          ClientMethod='get_object',
          Params={'Bucket': bucket, 'Key': key}, 
          ExpiresIn=1000
        )
        print("Got presigned URL: {}".format(url))
    except ClientError:
        print("Couldn't get a presigned URL for client method {}.".format(client_method))
        raise
    return url
