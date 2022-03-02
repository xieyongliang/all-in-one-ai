import json
import boto3
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    transform_job_name = event['body']['transform_job_name']

    response = sagemaker_runtime_client.describe_transform_job(
        TransformJobName = transform_job_name
    )
    
    return json.dumps(response, default = defaultencode)
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
