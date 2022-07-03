import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
import traceback

video_connection_table = 'all_in_one_ai_video_connection'
ddbh = helper.ddb_helper({'table_name': video_connection_table})

def lambda_handler(event, context):
    print(event)

    payload = json.loads(event['body'])
    camera_id = payload['camera_id']
    
    connection_id = event['requestContext']['connectionId']
    
    try:
        items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))
        
        for item in items:
            key = {
                'camera_id' : camera_id,
                'connection_id': item['connection_id']
            }
            ddbh.delete_item(key)
    
        params = {}
        params['camera_id'] = camera_id
        params['connection_id'] = connection_id
        ddbh.put_item(params)
        
        return {
            'statusCode': 200
        }
    
    except Exception as e:
        traceback.print_exc()
        print(e)
    
        return {
            'statusCode': 400,
            'body': str(e)
        }
