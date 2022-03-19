import json
import boto3
import base64
import os

endpoints = {
  "track": "all-in-one-ai-yolov5-track",
  "mask": "all-in-one-ai-yolov5-mask"
}

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        payload = event['body']

        print(event['headers'])
        print(event['queryStringParameters'])

        model_name = None
        if event['queryStringParameters'] != None:
            if 'model' in event['queryStringParameters']:
                model_name = event['queryStringParameters']['model']
        
        if('Content-Type' in event['headers']):
            content_type = event['headers']['Content-Type']
        elif('content-type' in event['headers']):
            content_type = event['headers']['content-type']
        else:
            content_type = None

        if(model_name not in endpoints or content_type == None):
            return {
                'statusCode': 400,
                'body': "Invalid parameter"
            }
        if('endpoint_name' in event['body']):
            endpoint_name = event['body']['endpoint_name']
        else:
            endpoint_name = endpoints[model_name]

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
            return {
                'statusCode': response['StatusCode'],
                'body': response["Payload"].read().decode("utf-8")
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

        
    
