import json
import boto3
import helper
import random
import string
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from datetime import date, datetime, timedelta
from decimal import Decimal

ssmh = helper.ssm_helper()

lambda_client = boto3.client('lambda')

greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    print(event)
    component_name = None
    if('pathParameters' in event):
        if(event['pathParameters'] != None):
            component_name = event['pathParameters']['component_name']

    if(component_name == None and event['httpMethod'] == 'POST'):
        if('component_name' in event['body']):
            payload = json.loads(event['body'])
            component_name = payload['component_name']
        else:
            return {
                'statusCode': 400,
                'body': 'Parameter - component_name is missing'
            }
    elif(component_name == None and event['httpMethod'] == 'GET'):
        payload = []
        
        paginator = greengrassv2_client.get_paginator("list_components")
        pages = paginator.paginate()
        for page in pages:
            for component in page['components']:
                component_arn = component['arn']

                items = {}
                paginator = greengrassv2_client.get_paginator("list_component_versions")
                pages = paginator.paginate(arn = component_arn)
                for page in pages:
                    for component_version in page['componentVersions']:
                        print(component_version)
                        name = component_version['componentName']
                        version = component_version['componentVersion']
                        arn = component_version['arn']
                        if(name in items):
                            items[name]['component_versions'].append(version)
                            items[name]['component_version_arns'].append(arn)
                        else:
                            payload.append(items)
                            items[name] = {}
                            items[name]['component_versions'] = []
                            items[name]['component_version_arns'] = []
                            items[name]['component_versions'].append(version)
                            items[name]['component_version_arns'].append(arn)
            
        return {
            'statusCode': 200,
            'body': json.dumps(payload, default = defaultencode)
        }


    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])
        print(request)

        component_template_url = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/greengrass/components/{0}/template'.format(component_name))
        component_artifacts_url = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/greengrass/components/{0}/artifacts'.format(component_name))
        payload = {}
        payload['model_data_url'] = request['model_data_url']
        payload['component_template_artifact_url'] = component_template_url + '/com.example.yolov5.zip' 
        payload['component_template_receipt_url'] = component_template_url + '/com.example.yolov5.json'
        payload['component_data_url'] = '{0}/com.example.yolov5-{1}.zip'.format(component_artifacts_url, ''.join(random.sample(string.ascii_lowercase + string.digits, 6)))
        payload['component_version'] = request['component_version']
        
        response = lambda_client.invoke(
            FunctionName='all_in_one_ai_greengrass_create_component_version',
            InvocationType='RequestResponse',
            Payload=json.dumps({'body': payload})
        )

        print(response)
        if('FunctionError' not in response):
            return {
                'statusCode': response['StatusCode'],
                'body': response["Payload"].read().decode("utf-8")
            }
        else:
            return {
                'statusCode': 400,
                'body': response['FunctionError'],
            }
    else:
        component_version_arn = None
        if 'component_version_arn' in event['pathParameters']:
            component_version_arn = event['pathParameters']['component_version_arn']
        
        if(component_version_arn != None):
            response = greengrassv2_client.describe_component(
                arn = component_version_arn
            )

            return {
                    'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                    'body': json.dumps(response, default = defaultencode)
            }
            
        else:
            paginator = greengrassv2_client.get_paginator("list_components")
            pages = paginator.paginate()
            for page in pages:
                component_arn = None
                
                for component in page['components']:
                    if(component['componentName'] == component_name):
                        component_arn = component['arn']
                        break
                
                if(component_arn == None):
                    return {
                            'statusCode': 200,
                            'body': '[]'
                    }
                
                payload = []

                paginator2 = greengrassv2_client.get_paginator("list_component_versions")
                pages2 = paginator2.paginate(arn = component_arn)
                for page2 in pages2:
                    for component_version in page2['componentVersions']:
                        payload.append({'component_name': component_version['componentName'], 'component_version': component_version['componentVersion'], 'component_version_arn':component_version['arn']})
            
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
