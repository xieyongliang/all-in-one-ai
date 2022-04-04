import json
import boto3

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        payload = event['body']

        print(event['headers'])
        print(event['queryStringParameters'])

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

        
    
