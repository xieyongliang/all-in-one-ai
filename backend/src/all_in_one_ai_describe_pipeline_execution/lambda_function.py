import json
import boto3
from decimal import Decimal
from datetime import date, datetime, timedelta

sagemaker_client = boto3.client("sagemaker")

def lambda_handler(event, context):
    pipeline_execution_arn = event['body']['pipeline_execution_arn']
    
    response = sagemaker_client.describe_pipeline_execution(
            PipelineExecutionArn = pipeline_execution_arn
        )
    
    print(response)
    
    return json.dumps(response, default = defaultencode)

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")