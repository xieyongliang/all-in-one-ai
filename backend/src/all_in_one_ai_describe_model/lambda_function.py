import json
import boto3
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    model_name = event['body']['model_name']

    response = sagemaker_client.describe_model(
        ModelName = model_name
    )
    
    return json.dumps(response, default = defaultencode)
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
