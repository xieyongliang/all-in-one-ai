import json
import boto3
import traceback
from decimal import Decimal
from datetime import date, datetime

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
        endpoint_name = event['body']['endpoint_name']
    
        response = sagemaker_client.describe_endpoint(
            EndpointName = endpoint_name
        )
            
        endpoint_config_name = response['EndpointConfigName']
            
        response['EndpointConfig'] = sagemaker_client.describe_endpoint_config(
            EndpointConfigName = endpoint_config_name
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