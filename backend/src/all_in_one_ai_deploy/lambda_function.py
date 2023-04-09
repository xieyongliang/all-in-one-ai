import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback
import sagemaker
import os
import helper

ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
lambda_client = boto3.client('lambda')
sagemaker_session = sagemaker.Session()
bucket = sagemaker_session.default_bucket()

def lambda_handler(event, context):
    print(event)

    request = json.loads(event['body'])
    
    try:
        algorithm = request['model_algorithm']
        industrial_model = request['industrial_model']
        model_name = request['model_name']
        model_environment = json.loads(request['model_environment']) if(request['model_environment'] != '{}') else None
        model_data_url = request['model_data_url'] if(request['model_data_url'] != '') else None
        endpoint_name = request['endpoint_name']
        instance_type = request['instance_type']
        instance_count = int(request['initial_instance_count'])

        if(model_data_url == None):
            try: 
                model_data_url =  ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/artifact'.format(algorithm))
            except Exception:
                model_data_url = ''

        if(algorithm == 'yolov5'):            
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
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
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_mxnet',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'gluonts'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
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
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'gabsa'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py3',
                    'framework_version': '1.7.1',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'paddlenlp'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'paddleocr'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'mdeberta'):
            hub = {
                'HF_MODEL_ID':'MoritzLaurer/mDeBERTa-v3-base-mnli-xnli',
                'HF_TASK':'zero-shot-classification'
            }            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'transformers_version': '4.6.1',
                    'pytorch_version': '1.7.1',
                    'py_version': 'py36',
                    'model_name': model_name,
                    'model_data': None,
                    'hub': hub,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_huggingface',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'keybert'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'stylegan'):
            image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/inference_image'.format(algorithm))
            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'model_name': model_name,
                    'image_uri': image_uri,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_generic',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'stablediffusion'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.10',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'deploy_type': 'async'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        elif(algorithm == 'stable-diffusion-webui'):
            image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/inference_image'.format(algorithm))
            if not model_environment:
                model_environment = {}

            if 'embeddings_s3uri' not in model_environment:
                model_environment['embeddings_s3uri'] = 's3://{0}/stable-diffusion-webui/embeddings/'.format(bucket)
            if 'hypernetwork_s3uri' not in model_environment:
                model_environment['hypernetwork_s3uri'] = 's3://{0}/stable-diffusion-webui/hypernetwork/'.format(bucket)
            if 'generated_images_s3uri' not in model_environment:
                model_environment['generated_images_s3uri'] = 's3://{0}/stable-diffusion-webui/generated/'.format(bucket)
            if 'api_endpoint' not in model_environment:
                model_environment['api_endpoint'] = ssmh.get_parameter('/all_in_one_ai/config/meta/api_endpoint')

            vpc_config = {}
            vpc_config['Subnets'] =  [ os.environ['PrivateSubnet1'], os.environ['PrivateSubnet2'] ]
            vpc_config['SecurityGroupIds'] = [ os.environ['SecurityGroup'] ]

            if endpoint_name == '':
                base_name = sagemaker.utils.base_name_from_image(image_uri)
                endpoint_name = sagemaker.utils.name_from_base(base_name)
            
            model_environment['endpoint_name'] = endpoint_name

            if 'volume_size_in_gb' in model_environment:
                volume_size_in_gb = int(model_environment['volume_size_in_gb'])
                model_environment.pop('volume_size_in_gb')
            else:
                volume_size_in_gb = 225

            if 'container_startup_health_check_timeout' in model_environment:
                container_startup_health_check_timeout = int(model_environment['container_startup_health_check_timeout'])
                model_environment.pop('container_startup_health_check_timeout')
            else:
                container_startup_health_check_timeout = 1800

            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'model_name': model_name,
                    'image_uri': image_uri,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'deploy_type': 'async',
                    'vpc_config': vpc_config,
                    'volume_size_in_gb': volume_size_in_gb,
                    'container_startup_health_check_timeout': container_startup_health_check_timeout
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_generic',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )

        elif(algorithm == 'detr'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            payload = {
                'body': {
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'entry_point': 'inference.py',
                    'source_dir': source_dir,
                    'py_version': 'py38',
                    'framework_version': '1.9.0',
                    'model_name': model_name,
                    'model_data': model_data_url,
                    'model_environment': model_environment,
                    'endpoint_name': endpoint_name,
                    'instance_type': instance_type,
                    'instance_count': instance_count
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_deploy_pytorch',
                InvocationType = 'Event',
                Payload = json.dumps(payload)
            )
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported algorithm'
            }
        
        payload = str(response['Payload'].read())
        print(payload)
        
        return {
            'statusCode': 200,
            'body': json.dumps(str(response), default = defaultencode)
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