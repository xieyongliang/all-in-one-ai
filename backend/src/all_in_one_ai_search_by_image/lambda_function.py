import json
import boto3
import base64
import os
import helper
from botocore.exceptions import ClientError
from elasticsearch import Elasticsearch

lambda_client = boto3.client('lambda')
s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))
import_jobs_table = 'all_in_one_ai_import_jobs'
ddbh = helper.ddb_helper({'table_name': import_jobs_table})

def lambda_handler(event, context):
    print(event)
    industrial_model = event['queryStringParameters']['industrial_model']
    
    item = ddbh.get_item({'industrial_model': industrial_model})
    input_s3uri = item['input_s3uri'] if(item != None) else None
    output_s3uri = item['output_s3uri'] if(item != None) else None

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
            body = response["Payload"].read().decode("utf-8")
            payload = json.loads(body)
            statusCode = payload['statusCode']
            if(statusCode == 200):
                payload = json.loads(payload['body'])
                prediction = payload['result']
                print(prediction)
                response = es.search(
                    request_timeout=30, index=index,
                    body={
                        'size': k_neighbors,
                        'query': {'knn': {'img_vector': {'vector': prediction, 'k': k_neighbors}}}}
                    )
                print(response)
                payload = []
                for x in range(k_neighbors):
                    if(input_s3uri == None and output_s3uri == None):
                        if x >= len(response['hits']['hits']):
                            break
                        image_s3uri = response['hits']['hits'][x]['_source']['img_s3uri']
                    else:
                        s3uri = response['hits']['hits'][x]['_source']['img_s3uri']
                        image_s3uri = '{0}{1}'.format(input_s3uri, s3uri[len(output_s3uri) : -4])
                        print(image_s3uri)
                    bucket, key = get_bucket_and_key(image_s3uri)

                        
                    httpuri = get_presigned_url(bucket, key)
                    score = response['hits']['hits'][x]['_score']
                    
                    payload.append({
                        'httpuri': httpuri,
                        'score': score,
                        'bucket': bucket,
                        'key': key
                    })
            return {
                'statusCode': 200,
                'body': json.dumps(payload)
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
    except ClientError as e:
        print(str(e))
        raise
    return url
