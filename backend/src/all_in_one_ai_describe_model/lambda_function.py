import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
        model_name = event['body']['model_name']
        response = sagemaker_client.describe_model(
            ModelName = model_name
        )
        return {
            'statusCode': 200,
            'body': json.dumps(response, default = defaultencode)
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