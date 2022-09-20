import json
import boto3
import helper
from datetime import date, datetime
from decimal import Decimal
import traceback
from botocore.exceptions import EndpointConnectionError

ssmh = helper.ssm_helper()

lambda_client = boto3.client('lambda')

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    try:
        print(event)
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)

            component_name = 'com.example.yolov5'

            deployment_policies = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/greengrass/components/{0}/deployment/deployment_policy'.format(component_name))
            iot_job_configurations = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/greengrass/components/{0}/deployment/iot_job_configurations'.format(component_name))
            
            payload = {}
            payload['deployment_name'] = ''
            if('deployment_name' in request):
                payload['deployment_name'] = request['deployment_name']
            payload['target_arn'] = request['target_arn']
            payload['components'] = request['components']
            payload['iot_job_configurations'] = json.loads(iot_job_configurations)
            payload['deployment_policies'] = json.loads(deployment_policies)
            
            response = lambda_client.invoke(
                FunctionName='all_in_one_ai_greengrass_create_deployment',
                InvocationType='RequestResponse',
                Payload=json.dumps({'body': payload})
            )

            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                return {
                    'statusCode': payload['statusCode'],
                    'body': payload['body']
                }
            else:
                return {
                    'statusCode': 400,
                    'body': response['FunctionError']
                }
        else:
            deployment_id = None
            if(event['pathParameters'] != None):
                if('deployment_id' in event['pathParameters']):
                    deployment_id = event['pathParameters']['deployment_id']
            
            if(deployment_id != None):
                response = greengrassv2_client.get_deployment(
                    deploymentId = deployment_id
                )

                return {
                        'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                        'body': json.dumps(response, default = defaultencode)
                }
                
            else:
                payload = []
                
                paginator = greengrassv2_client.get_paginator("list_deployments")
                pages = paginator.paginate()
                for page in pages:
                    payload += page['deployments']
                return {
                    'statusCode': 200,
                    'body': json.dumps(payload, default = defaultencode)
                }

    except Exception as e:
        traceback.print_exc()
        if isinstance(e, EndpointConnectionError):
            return {
                'statusCode': 200,
                'body': json.dumps([], default = defaultencode)
            }
        else:
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
