import helper
from boto3.dynamodb.conditions import Key
import traceback

websocket_connection_table = 'all_in_one_ai_websocket_connection'
ddbh = helper.ddb_helper({'table_name': websocket_connection_table})

def lambda_handler(event, context):
    print(event)
    
    connection_id = event['requestContext']['connectionId']
    
    try:
        items = ddbh.scan(FilterExpression=Key('connection_id').eq(connection_id))
        
        for item in items:
            key = {
                'connection_id' : item['connection_id']
            }
            ddbh.delete_item(key)
    
        return {
            'statusCode': 200
        }
    
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
