import json
import traceback
import boto3
import os

sm_client = boto3.client('secretsmanager')

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
