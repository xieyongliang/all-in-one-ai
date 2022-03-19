import boto3
import time

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    endpoint_name = event['body']['endpoint_name']
    
    if('endpoint_config_name' in event['body']):
        endpoint_config_name = event['body']['endpoint_config_name']
    else:
        current_time = time.strftime("%m-%d-%H-%M-%S", time.localtime())
        endpoint_config_name = "{}-{}".format(endpoint_name, current_time)
    
    model_name = event['body']['model_name']
    instance_type = event['body']['instance_type']
    initial_instance_count = event['body']['initial_instance_count']
    initial_variant_weight = event['body']['initial_variant_weight']
    tags = event['body']['tags'] if('tags' in event['body']) else []

    response = sagemaker_client.create_endpoint_config(
        EndpointConfigName = endpoint_config_name,
        ProductionVariants = [
            {
                'VariantName': 'AllTraffic',
                'ModelName': model_name,
                'InitialInstanceCount': initial_instance_count,
                'InstanceType': instance_type,
                'InitialVariantWeight': initial_variant_weight
            }
        ],
        Tags = tags
    )
    
    try:
        response = sagemaker_client.describe_endpoint(
            EndpointName = endpoint_name
        )

        response = sagemaker_client.update_endpoint(
            EndpointName = endpoint_name,
            EndpointConfigName = endpoint_config_name
        )
    except:
        response = sagemaker_client.create_endpoint(
            EndpointName = endpoint_name,
            EndpointConfigName = endpoint_config_name,
            Tags = tags
        )
    
    return response