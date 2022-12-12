import helper
import traceback
import uuid
import json

sd_user_table = 'all_in_one_ai_sd_user'
ddbh = helper.ddb_helper({'table_name': sd_user_table})

def lambda_handler(event, context):
    print(event)
    
    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)
            
            action = request.pop('action')
            
            if action == 'signup':
                ddbh.put_item(request)
                return {
                    'statusCode': 200,
                    'body': json.dumps(request)
                }
            elif action == 'signin':
                username = request['username']
                password = request['password']

                key = {
                    'username': username
                }
                
                item = ddbh.get_item(key)
                print(item)
                
                if item != None and password == item['password']:
                    return {
                        'statusCode': 200,
                        'body': json.dumps(item)
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': json.dumps({})
                    }                
            elif action == 'get':
                key = {
                    'username': request.pop('username')
                }
                response = ddbh.get_item(key)
                options = response['options'] if 'options' in response else ''
                return {
                    'statusCode': 200,
                    'body': options
                }
            elif action == 'edit':
                key = {
                    'username': request.pop('username')
                }
                ddbh.update_item(key, request)
                return {
                    'statusCode': 200,
                    'body': json.dumps(request)
                }
            elif action == 'delete':
                username = request['username']
                password = request['password']
                
                key = {
                    'username': username
                }
                
                item = ddbh.get_item(key)
                print(item)
                
                if item != None and password == item['password']:
                    key = {
                        'username': username
                    }
                
                    items = ddbh.delete_item(key) 
                    
                    return {
                        'statusCode': 200,
                        'body': json.dumps(item)
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': json.dumps({})
                    }                    
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP method'
            }    
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
            'body': str(e)
        }
