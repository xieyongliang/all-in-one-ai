import boto3
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    try:
        model_name = event['body']['model_name']
        role_arn = event['body']['role_arn']
        tags = event['body']['tags'] if('tags' in event['body']) else []
        model_environment = event['body']['model_environment']
        response = None
    
        if('model_package_arn' in event['body']):
            model_package_arn = event['body']['model_package_arn']
            response = sagemaker_client.create_model(
                ModelName = model_name, 
                ExecutionRoleArn = role_arn, 
                Containers = [
                    {
                        'ModelPackageName' : model_package_arn, 
                        'Environment' : model_environment 
                    }
                ],
                Tags = tags
            )
        else:
            inference_image = event['body']['inference_image']
            model_data_url = None
            if('model_data_url' in event['body']):
                model_data_url = event['body']['model_data_url']
            mode = event['body']['mode']
    
            if(model_data_url != None):
                response = sagemaker_client.create_model(
                    ModelName = model_name,
                    PrimaryContainer={
                        'ContainerHostname': 'Container1',
                        'Image': inference_image,
                        'Mode': mode,
                        'ModelDataUrl': model_data_url,
                        'Environment' : model_environment
                    },
                    ExecutionRoleArn = role_arn,
                    EnableNetworkIsolation = False,
                    Tags = tags
                )
            else:
                response = sagemaker_client.create_model(
                    ModelName = model_name,
                    PrimaryContainer={
                        'ContainerHostname': 'Container1',
                        'Image': inference_image,
                        'Mode': mode,
                        'Environment' : model_environment
                    },
                    ExecutionRoleArn = role_arn,
                    EnableNetworkIsolation = False,
                    Environment =  model_environment,
                    Tags = tags
                )
                
        print(response)
        return {
            'statusCode': 200,
            'body': response
        }
    
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
