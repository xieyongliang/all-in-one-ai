import json
import boto3
import traceback
import sagemaker
from sagemaker.model import Model
from sagemaker.predictor import Predictor
from sagemaker.async_inference import AsyncInferenceConfig
from utils import persist_meta
from datetime import datetime

lambda_client = boto3.client('lambda')
sagemaker_session = sagemaker.Session()
bucket = sagemaker_session.default_bucket()

def lambda_handler(event, context):
    print(event)
        
    try:
        time = datetime.now().isoformat()
        pipeline_id = event['body']['pipeline_id'] if('pipeline_id' in event['body']) else None
        model_name = event['body']['model_name'] if('model_name' in event['body'] and event['body']['model_name'] != '') else None
        image_uri = event['body']['image_uri']
        endpoint_name = event['body']['endpoint_name'] if('endpoint_name' in event['body'] and event['body']['endpoint_name'] != '') else None
        industrial_model = event['body']['industrial_model']
        model_data = event['body']['model_data']
        model_environment = event['body']['model_environment']
        role = event['body']['role']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        deploy_type = event['body']['deploy_type'] if 'deploy_type' in event['body'] else 'sync'
        vpc_config = event['body']['vpc_config'] if 'vpc_config' in event['body'] else None
        volume_size_in_gb = event['body']['volume_size_in_gb'] if 'volume_size_in_gb' in event['body'] else None
        container_startup_health_check_timeout = event['body']['container_startup_health_check_timeout'] if 'volume_size_in_gb' in event['body'] else None

        model = Model(
            name=model_name,
            model_data=model_data,
            role=role,
            image_uri=image_uri,
            env=model_environment,
            predictor_cls=Predictor,
            vpc_config=vpc_config
        )

        async_config = AsyncInferenceConfig(output_path='s3://{0}/{1}/asyncinvoke/out/'.format(bucket, industrial_model))

        predictor = model.deploy(
            endpoint_name=endpoint_name,
            instance_type=instance_type,
            initial_instance_count=instance_count,
            async_inference_config=async_config if deploy_type == 'async' else None,
            # volume_size_in_gb=volume_size_in_gb,
            container_startup_health_check_timeout=container_startup_health_check_timeout,
            wait = False
        )

        persist_meta(model.name, model.endpoint_name, industrial_model, pipeline_id)

        payload = {
            'body': {
                'time': time,
                'type': 'deploy',
                'status': 1
            }
        }

        response = lambda_client.invoke(
            FunctionName='all_in_one_ai_websocket_send_message',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 200,
            'body': {
                'model_name': model.name,
                'endpoint_name': predictor.endpoint_name
            }
        }

    except Exception as e:
        traceback.print_exc()

        payload = {
            'body': {
                'time': time,
                'type': 'deploy',
                'status': -1,
                'message': str(e)                
            }
        }

        response = lambda_client.invoke(
            FunctionName='all_in_one_ai_websocket_send_message',
            InvocationType='RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 400,
            'body': str(e)
        }