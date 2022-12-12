import json
import boto3
from botocore.config import Config
from sagemaker.predictor import Predictor
from sagemaker.predictor_async import AsyncPredictor
from sagemaker.serializers import JSONSerializer
from sagemaker.deserializers import JSONDeserializer
import base64
import traceback

s3_client = boto3.client('s3')

config = Config(
    read_timeout=120,
    retries={
        'max_attempts': 0
    }
)

sagemaker_runtime_client = boto3.client('sagemaker-runtime', config = config)
sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    
    try:
        endpoint_name = event['endpoint_name']
        content_type = event['content_type']
        payload = event['payload']
        
        body = payload if(content_type == 'application/json') else base64.b64decode(payload)

        response = sagemaker_client.describe_endpoint(
            EndpointName = endpoint_name
        )
        
        infer_type = 'async' if ('AsyncInferenceConfig' in response) else 'sync'

        if(infer_type == 'sync'):
            response = sagemaker_runtime_client.invoke_endpoint(
                EndpointName = endpoint_name,
                ContentType = content_type,
                Body = body)
                
            print(response)
            body = response['Body'].read()
        else:
            data = json.loads(payload)
            print(data)
            predictor = Predictor(
                endpoint_name,
                serializer = JSONSerializer(),
                deserializer = JSONDeserializer()
            )
            async_predictor = AsyncPredictor(
                predictor,
                name = endpoint_name)
            response = async_predictor.predict_async(data)

            print(response)
            body = response.output_path


        return {
            'statusCode': 200,
            'body': body
        }
    
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
