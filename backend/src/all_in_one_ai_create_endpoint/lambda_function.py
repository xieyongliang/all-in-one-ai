import boto3
import time
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    try:
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
        
        if(endpoint_exists(endpoint_name)):
            response = sagemaker_client.update_endpoint(
                EndpointName = endpoint_name,
                EndpointConfigName = endpoint_config_name
            )
        else:
            response = sagemaker_client.create_endpoint(
                EndpointName = endpoint_name,
                EndpointConfigName = endpoint_config_name,
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

def endpoint_exists(endpoint_name):
    response = sagemaker_client.list_endpoints(NameContains=endpoint_name)
    results = list(filter(lambda x: x['EndpointName'] == endpoint_name, response['Endpoints']))
    
    return len(results) > 0
