import json
import traceback
from datetime import datetime

default_username = 'admin'
default_password = 'admin'

def lambda_handler(event, context):
    print(event)

    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)

            username = request['username']
            password = request['password']
            now = datetime.now()
            current_time = now.strftime("%H:%M")

            if username == default_username and password == default_password + current_time:
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
