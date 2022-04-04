import boto3
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    try:
        model_name = event['body']['model_name']
        role_arn = event['body']['role_arn']
        tags = event['body']['tags'] if('tags' in event['body']) else []
        response = None
    
        if('model_package_arn' in event['body']):
            model_package_arn = event['body']['model_package_arn']
            container = { "ModelPackageName" : model_package_arn }
            response = sagemaker_client.create_model(
                ModelName = model_name, 
                ExecutionRoleArn = role_arn, 
                Containers=[container],
                Tags = tags
            )
        else:
            container_image = event['body']['container_image']
            model_data_url = None
            if('model_data_url' in event['body']):
                model_data_url = event['body']['model_data_url']
            mode = event['body']['mode']
    
            if(model_data_url != None):
                response = sagemaker_client.create_model(
                    ModelName = model_name,
                    PrimaryContainer={
                        'ContainerHostname': 'Container1',
                        'Image': container_image,
                        'Mode': mode,
                        'ModelDataUrl': model_data_url
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
                        'Image': container_image,
                        'Mode': mode
                    },
                    ExecutionRoleArn = role_arn,
                    EnableNetworkIsolation = False,
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
