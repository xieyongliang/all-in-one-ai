import json
import traceback
import boto3
import os

sm_client = boto3.client('secretsmanager')
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)

    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)

            administrator_login = sm_client.get_secret_value(
                SecretId=os.environ['Administratorlogin']
            )
            default_username = json.loads(administrator_login['SecretString'])['username']
            default_password = json.loads(administrator_login['SecretString'])['password']

            username = request['username']
            password = request['password']

            if username == default_username and password == default_password:
                return {
                    'statusCode': 200,
                    'body': ''
                }
            elif username != default_username:
                payload = {
                    'action': 'signin',
                    'username': request['username'],
                    'password': request['password']
                }
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_sd_user',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body': json.dumps(payload), 'httpMethod': 'POST'})
                )
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)

                    if(payload['statusCode'] == 200):
                        return {
                            'statusCode': payload['statusCode'],
                            'body': json.dumps(payload['body'])
                        }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
            else:
                return {
                    'statusCode': 400,
                    'body': 'Mismatched username/password'
                }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP Method'                
            }
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
