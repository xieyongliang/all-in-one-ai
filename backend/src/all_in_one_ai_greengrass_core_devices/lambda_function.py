import json
import boto3
from datetime import date, datetime
from decimal import Decimal

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    response = greengrassv2_client.list_core_devices()
    
    return {
        'statusCode': 200,
        'body': json.dumps(response['coreDevices'], default = defaultencode)
    }

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
