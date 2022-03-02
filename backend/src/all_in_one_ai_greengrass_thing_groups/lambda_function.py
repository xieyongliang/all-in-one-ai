import json
import boto3

iot_client = boto3.client('iot')

def lambda_handler(event, context):
    response = iot_client.list_thing_groups()
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['thingGroups'])
    }

