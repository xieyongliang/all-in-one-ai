import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    response = None
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
            
            model_package_group_name = request['model_package_group_name']
            model_package_group_input_dict = {
                "ModelPackageGroupName" : model_package_group_name
            }
            response = sagemaker_client.create_model_package_group(**model_package_group_input_dict)
            response['creation_time'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            return {
                'statusCode': 200,
                'body': json.dumps(response)
            }
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
        }
    else:
        payload = []
        paginator = sagemaker_client.get_paginator("list_model_package_groups")
        pages = paginator.paginate()
        for page in pages:
            payload += page['ModelPackageGroupSummaryList']
    return {
        'statusCode': 200,
        'body': json.dumps(payload, default = defaultencode)
    }

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")