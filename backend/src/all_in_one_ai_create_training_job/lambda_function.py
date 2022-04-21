import boto3
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event['body'])

    try:
        training_job_name = event['body']['training_job_name']
        hyperparameters = event['body']['hyperparameters']
        algorithm_specification = event['body']['algorithm_specification']
        role_arn = event['body']['role_arn']
        input_data_config = event['body']['input_data_config']
        output_data_config = event['body']['output_data_config']
        resource_config = event['body']['resource_config']
        tags = event['body']['tags']
    
        response = sagemaker_client.create_training_job(
            TrainingJobName = training_job_name,
            HyperParameters = hyperparameters,
            AlgorithmSpecification = algorithm_specification,
            RoleArn = role_arn,
            InputDataConfig = input_data_config,
            OutputDataConfig = output_data_config,
            ResourceConfig = resource_config,
            StoppingCondition = {
                'MaxRuntimeInSeconds': 86400
            },
            EnableNetworkIsolation = False,
            EnableInterContainerTrafficEncryption = False,
            EnableManagedSpotTraining = False,
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
