import json
import boto3
import traceback
from sagemaker.estimator import Estimator
from utils import persist_meta
from datetime import datetime

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    try:
        time = datetime.now().isoformat()
        job_name = event['body']['job_name'] if('job_name' in event['body'] and event['body']['job_name'] != '') else None
        industrial_model = event['body']['industrial_model']
        role = event['body']['role']
        image_uri = event['body']['image_uri']
        hyperparameters = event['body']['hyperparameters']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        subnets = event['body']['subnets'] if 'subnets' in event['body'] else None
        security_group_ids = event['body']['security_group_ids'] if 'security_group_ids' in event['body'] else None
        
        inputs = event['body']['inputs']

        estimator = Estimator(
            role=role,
            instance_count=instance_count,
            instance_type=instance_type,
            image_uri=image_uri,
            hyperparameters=hyperparameters,
            subnets=subnets,
            security_group_ids=security_group_ids
        )

        estimator.fit(inputs, job_name = job_name, wait = False)
        
        persist_meta(estimator._current_job_name, industrial_model)

        payload = {
            'body': {
                'time': time,
                'type': 'train',
                'status': 1
            }
        }

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_websocket_send_message',
            InvocationType = 'RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 200,
            'body': estimator._current_job_name
        }
            
    except Exception as e:
        traceback.print_exc()

        payload = {
            'body': {
                'time': time,
                'type': 'train',
                'status': -1,
                'message': str(e)
            }
        }

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_websocket_send_message',
            InvocationType = 'RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 400,
            'body': str(e)
        }