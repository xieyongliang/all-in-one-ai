import json
import boto3
import traceback
from decimal import Decimal
from datetime import date, datetime
from cachetools import cached, TTLCache

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
        result = list_training_jobs()
        
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

@cached(cache=TTLCache(maxsize=1, ttl=1))
def list_training_jobs():
    result = []
    paginator = sagemaker_client.get_paginator("list_training_jobs")
    pages = paginator.paginate()
    for page in pages:
        result += page['TrainingJobSummaries']
    return result

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")