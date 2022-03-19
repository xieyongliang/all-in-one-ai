import json
import boto3
import datetime
from botocore.config import Config
import base64

config = Config(
    read_timeout=120,
    retries={
        'max_attempts': 0
    }
)

sagemaker_runtime_client = boto3.client('sagemaker-runtime', config=config)

def lambda_handler(event, context):
    endpoint_name = event['endpoint_name']
    content_type = event['content_type']
    payload = event['payload']
    
    body = payload if(content_type == 'application/json') else base64.b64decode(payload)

    response = sagemaker_runtime_client.invoke_endpoint(
        EndpointName = endpoint_name,
        ContentType = content_type,
        Body = body)

    return response['Body'].read()