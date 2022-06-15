import os
import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
import traceback

video_connection_table = 'all_in_one_video_connection'
ddbh = helper.ddb_helper({'table_name': video_connection_table})

def lambda_handler(event, context):
    print(event)

    endpoint_url = os.environ['WEBSOCKET_API']
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url = endpoint_url)
    
    camera_id = None
    data = None
    camera_id = event['body']['camera_id']
    data = event['body']['data']


    try:
        if(camera_id != None):
            items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))
        
            for item in items:
                connection_id = item['connection_id']
                
                gatewayapi.post_to_connection(
                    ConnectionId = connection_id, 
                    Data = json.dumps(data).encode('utf-8')
                )

        return {
            'statusCode': 200
        }
    
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
