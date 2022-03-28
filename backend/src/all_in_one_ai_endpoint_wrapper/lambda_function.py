import boto3
import json
import botocore

lambda_client = boto3.client('lambda', config = botocore.config.Config(retries={'max_attempts': 0}, read_timeout=900 ))

def lambda_handler(event, context):
    print(event)
    
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_endpoint',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
    )
    print(response)
    if('FunctionError' in response):
        return {
            'statusCode': 400,
            'body': response['FunctionError']
        }
    payload = json.loads(response['Payload'].read().decode('utf-8'))
    print(payload)
    
    return {
        'statusCode': payload['statusCode'],
        'body': payload['body']
    }