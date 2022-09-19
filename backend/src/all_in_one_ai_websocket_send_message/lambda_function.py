import json
import traceback
import os
import boto3
import helper
from boto3.dynamodb.conditions import Key
from datetime import datetime

websocket_connection_table = 'all_in_one_ai_websocket_connection'
ddbh = helper.ddb_helper({'table_name': websocket_connection_table})

def lambda_handler(event, context):
    print(event)

    endpoint_url = os.environ['WEBSOCKET_API']
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url = endpoint_url)

    data = event['body']
    
    print(json.dumps(data, ensure_ascii = False))

    items = ddbh.scan()

    for item in items:
        connection_id = item['connection_id']

        try:
            gatewayapi.post_to_connection(
                ConnectionId = connection_id,
                Data = json.dumps(data, ensure_ascii = False)
            )
        except Exception as e:
            try:
                items = ddbh.scan(FilterExpression=Key('connection_id').eq(connection_id))
                
                for item in items:
                    key = {
                        'connection_id' : item['connection_id']
                    }
                    ddbh.delete_item(key)
            
            except Exception as e:
                traceback.print_exc()

    return {
        'statusCode': 200
    }
