import json
import boto3
import traceback
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
        result = [];
        paginator = sagemaker_client.get_paginator("list_transform_jobs")
        pages = paginator.paginate()
        for page in pages:
            result += page['TransformJobSummaries']
        
        return {
            'statusCode': 200,
            'body': json.dumps(result, default = defaultencode)
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