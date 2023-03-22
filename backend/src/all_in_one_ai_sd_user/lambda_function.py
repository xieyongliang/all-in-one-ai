import helper
import traceback
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
            
            if action == 'signin':
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
                        'body': 'Mismatched username/password'
                    }                
            elif action == 'load':
                items = ddbh.scan()
                return {
                    'statusCode': 200,
                    'body': json.dumps(items)
                }
            elif action == 'save':
                updated = 0
                created = 0
                deleted = 0
                items_new = request['items']
                items_origin = ddbh.scan()
                items = {}
                for item_origin in items_origin:
                    items[item_origin['username']] = item_origin['password']
                for item_new in items_new:
                    username = item_new['username']
                    if username in items:
                        key = {
                            'username': username
                        }
                        item_new.pop('username')
                        ddbh.update_item(key, item_new)
                        updated += 1
                        items.pop(username)
                    elif username != '':
                        ddbh.put_item(item_new)
                        created += 1
                for username in items:
                    key = {
                        'username': username
                    }                    
                    items = ddbh.delete_item(key)
                    deleted += 1
                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'created': created,
                            'updated': updated,
                            'deleted': deleted
                        }
                    )
                }
            elif action == 'get':
                key = {
                    'username': request.pop('username')
                }
                response = ddbh.get_item(key)
                options = response.get('options', '')
                attrs = response.get('attributes', {})
                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'options': options,
                            'attributes': attrs,
                        }
                    )
                }
            elif action == 'put':
                key = {
                    'username': request.pop('username')
                }
                ddbh.update_item(key, request)
                return {
                    'statusCode': 200,
                    'body': json.dumps(request)
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
