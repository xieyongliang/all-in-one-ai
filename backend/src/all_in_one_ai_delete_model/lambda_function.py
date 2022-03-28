import json
import boto3
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
        model_name = event['body']['model_name']
        response = sagemaker_client.delete_model(
            ModelName = model_name
        )
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
    
    
    return {
        'statusCode': 200,
        'body': ''
    }