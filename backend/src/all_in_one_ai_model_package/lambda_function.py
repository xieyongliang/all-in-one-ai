import json
import boto3
import helper
from decimal import Decimal
from datetime import date, datetime
import traceback

sagemaker_client = boto3.client('sagemaker')

ssmh = helper.ssm_helper()

def lambda_handler(event, context):
    print(event)
    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            
            model_package_group_name = event['pathParameters']['model_package_group_name']
            model_algorithm = request['model_algorithm']
            inference_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/sagemaker/image'.format(model_algorithm))
            model_package_description = request['model_package_description'] if('model_package_description' in request) else ''
            model_approval_status = request['model_approval_status'] if('model_approval_status' in request) else 'Approved'
            container_image = request['container_image'] if('container_image' in request and request['container_image'] != '') else inference_image
            model_data_url = request['model_data_url']
            supported_content_types = request['supported_content_types']
            supported_response_mime_types = request['supported_response_mime_types']
            
            modelpackage_inference_specification =  {
                "InferenceSpecification": {
                  "Containers": [
                     {
                        "Image": container_image,
                        "ModelDataUrl": model_data_url
                     }
                  ],
                  "SupportedContentTypes": supported_content_types.split(' '),
                  "SupportedResponseMIMETypes": supported_response_mime_types.split(' ')
               }
            }
    
            create_model_package_input_dict = {
                "ModelPackageGroupName" : model_package_group_name,
                "ModelPackageDescription" : model_package_description,
                "ModelApprovalStatus" : model_approval_status
            }
            create_model_package_input_dict.update(modelpackage_inference_specification)
            
            response = sagemaker_client.create_model_package(**create_model_package_input_dict)
            payload = response
        else:
            model_package_arn = None
            if(event['queryStringParameters'] != None):
                if('model_package_arn' in event['queryStringParameters']):
                    model_package_arn = event['queryStringParameters']['model_package_arn']
            
            if(model_package_arn != None):
                response = sagemaker_client.describe_model_package(
                    ModelPackageName = model_package_arn
                )
                payload = response
            else:
                payload = []
                model_package_group_name = event['pathParameters']['model_package_group_name']
                paginator = sagemaker_client.get_paginator("list_model_packages")
                pages = paginator.paginate(ModelPackageGroupName = model_package_group_name)
                for page in pages:
                    payload += page['ModelPackageSummaryList']
        return {
            'statusCode': 200,
            'body': json.dumps(payload, default = defaultencode)
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