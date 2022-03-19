import json
import boto3
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    endpoint_name = event['body']['endpoint_name']

    waiter = sagemaker_client.get_waiter("endpoint_in_service")
    waiter.wait(EndpointName = endpoint_name)
    
    response = sagemaker_client.describe_endpoint(
        EndpointName = endpoint_name
    )

    return { 
        'statusCode': 200,
        'body': json.dumps(response, default = defaultencode)
    }
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")