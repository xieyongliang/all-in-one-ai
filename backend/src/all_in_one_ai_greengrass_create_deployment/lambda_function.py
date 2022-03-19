import json
import boto3
import tarfile
import zipfile
from io import BytesIO
from datetime import date, datetime, timedelta
from decimal import Decimal

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    payload = event['body']
    
    target_arn = payload['target_arn']
    deployment_name = payload['deployment_name']
    components = json.loads(payload['components'])
    iot_job_configurations = payload['iot_job_configurations']
    deployment_policies = payload['deployment_policies']
    
    if(deployment_name == ''):
        response = greengrassv2_client.create_deployment(
                        targetArn = target_arn,
                        components = components,
                        iotJobConfiguration = iot_job_configurations,
                        deploymentPolicies = deployment_policies
                    )
    else:
        response = greengrassv2_client.create_deployment(
                        targetArn = target_arn,
                        deploymentName = deployment_name,
                        components = components,
                        iotJobConfiguration = iot_job_configurations,
                        deploymentPolicies = deployment_policies
                )

    print(response)
    return json.dumps(response, default = defaultencode)

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")