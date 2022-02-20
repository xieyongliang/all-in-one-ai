import json
import boto3
import datetime
from botocore.config import Config
from boto3.session import Session
import base64

endpoints_dict = {
  "track": "all-in-one-ai-yolov5-track",
  "mask": "all-in-one-ai-yolov5-mask"
}

config = Config(
    read_timeout=120,
    retries={
        'max_attempts': 0
    }
)

sagemaker_runtime_client = boto3.client('sagemaker-runtime', config=config)
session = Session(sagemaker_runtime_client)

def lambda_handler(event, context):
    # TODO implement

    print(event)

    model = 'track'
    if event['queryStringParameters'] != None:
        if 'model' in event['queryStringParameters']:
            model = event['queryStringParameters']['model']

    if event['httpMethod'] == 'POST':
        payload = event['body']

        if('Content-Type' in event['headers']):
            content_type = event['headers']['Content-Type']
        else:
            content_type = event['headers']['content-type']

        start_time=datetime.datetime.utcnow()
        
        if content_type == 'application/json':
            body = payload
        else:
            body = base64.b64decode(payload)

        response = sagemaker_runtime_client.invoke_endpoint(
            EndpointName=endpoints_dict[model],
            ContentType=content_type,
            Body=body)
            
        end_time=datetime.datetime.utcnow()
        print(response)
        print(start_time)
        print(end_time)
        print(end_time-start_time)
        
        return {
            'statusCode': 200,
            'body': response["Body"].read()
        }

    else:
        return {
            'statusCode': 400,
            'body': "Unsupported HTTP method"
        }