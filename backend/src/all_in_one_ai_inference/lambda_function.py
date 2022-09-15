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
        post_process = event['queryStringParameters']['post_process'] if('post_process' in event['queryStringParameters']) else None
        keywords = json.loads(event['queryStringParameters']['keywords']) if('keywords' in event['queryStringParameters']) else None

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
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            print(payload['body'])
            if(post_process != None):
                body = {
                    'post_process': post_process,
                    'payload': json.loads(payload['body']),
                    'extra': keywords
                }
                
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_inference_post_process',
                    InvocationType = 'RequestResponse',
                    Payload = json.dumps(body)
                )                

                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    print(payload['body'])
                else:
                    return {
                        'statusCode': 400,
                        'body': response["FunctionError"]
                    }

            return {
                'statusCode': payload['statusCode'],
                'body': payload['body']
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
