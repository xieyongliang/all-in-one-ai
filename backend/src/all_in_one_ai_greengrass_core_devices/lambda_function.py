import json
import boto3
from datetime import date, datetime
from decimal import Decimal
import traceback

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    try:
        payload = []
        paginator = greengrassv2_client.get_paginator("list_core_devices")
        pages = paginator.paginate()
        for page in pages:
            payload += page['coreDevices']
        
        return {
            'statusCode': 200,
            'body': json.dumps(payload, default = defaultencode)
        }

    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }        

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")