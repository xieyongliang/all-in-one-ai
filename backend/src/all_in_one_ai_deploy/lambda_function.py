import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback
import helper


ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    request = json.loads(event['body'])
    
    try:
        algorithm = request['model_algorithm']
        model_name = request['model_name']
        model_data = request['model_data']
        endpoint_name = request['endpoint_name']
        instance_type = request['instance_type']
        instance_count = request['instance_count']
                
        if(algorithm == 'yolov5'):            
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.1',
                    'model_name': model_name,
                    'model_data': model_data,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'gluoncv'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py37',
                    'framework_version': '1.8.0',
                    'model_name': model_name,
                    'model_data': model_data,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_mxnet',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'cpt'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py37',
                    'framework_version': '1.8.0',
                    'model_name': model_name,
                    'model_data': model_data,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_huggingface',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 't5pegusas'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.1',
                    'model_name': model_name,
                    'model_data': model_data,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_tensorflow',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported algorithm'
            }
        
        payload = str(response['Payload'].read())
        
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