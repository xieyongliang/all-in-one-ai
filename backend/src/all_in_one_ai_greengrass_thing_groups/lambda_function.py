import json
import boto3
import traceback

iot_client = boto3.client('iot')

def lambda_handler(event, context):
    try:
        payload = []
        paginator = iot_client.get_paginator("list_thing_groups")
        pages = paginator.paginate()
        for page in pages:
            payload += page['thingGroups']
        return {
            'statusCode': 200,
            'body': json.dumps(payload)
        }
    
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }