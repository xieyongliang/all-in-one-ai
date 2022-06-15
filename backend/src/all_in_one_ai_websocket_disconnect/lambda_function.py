import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
import traceback

video_connection_table = 'all_in_one_ai_video_connection'
ddbh = helper.ddb_helper({'table_name': video_connection_table})

def lambda_handler(event, context):
    print(event)

    endpoint_url = "https://" + event["requestContext"]["domainName"] + "/" + event["requestContext"]["stage"]
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url = endpoint_url)
    
    connection_id = event['requestContext']['connectionId']
    
    try:
        items = ddbh.scan(FilterExpression=Key('connection_id').eq(connection_id))
        
        for item in items:
            key = {
                'camera_id' : item['camera_id'],
                'connection_id': connection_id
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
