import json
import boto3
from datetime import date, datetime
from decimal import Decimal
import traceback

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    try:
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
        return {
            'statusCode': 200,
            'body': response['deploymentId']
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