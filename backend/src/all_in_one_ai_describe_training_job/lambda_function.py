import json
import boto3
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    training_job_name = event['body']['training_job_name']

    response = sagemaker_client.describe_training_job(
        TrainingJobName = training_job_name
    )
    
    return json.dumps(response, default = defaultencode)
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
