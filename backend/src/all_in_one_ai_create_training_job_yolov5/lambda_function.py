import boto3
from botocore.exceptions import ClientError


sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event['body'])
    training_job_name = event['body']['training_job_name']
    training_image = event['body']['training_image']
    role_arn = event['body']['role_arn']
    instance_type = event['body']['instance_type']
    instance_count = event['body']['instance_count']
    volume_size_in_gb = event['body']['volume_size_in_gb']
    images_s3uri = event['body']['images_s3uri']
    labels_s3uri = event['body']['labels_s3uri']
    weights_s3uri = event['body']['weights_s3uri']
    cfg_s3uri = event['body']['cfg_s3uri']
    output_s3uri = event['body']['output_s3uri']
    tags = event['body']['tags'] if('tags' in event['body']) else []

    response = sagemaker_client.create_training_job(
        TrainingJobName = training_job_name,
        HyperParameters = {
        },
        AlgorithmSpecification = {
            'TrainingImage': training_image,
            'TrainingInputMode': 'File',
            'EnableSageMakerMetricsTimeSeries': True
        },
        RoleArn = role_arn,
        InputDataConfig = [
            {
                'ChannelName': 'cfg',
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': 'S3Prefix',
                        'S3Uri': cfg_s3uri,
                        'S3DataDistributionType': 'FullyReplicated'
                    }
                }
            },
            {
                'ChannelName': 'weights',
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': 'S3Prefix',
                        'S3Uri': weights_s3uri,
                        'S3DataDistributionType': 'FullyReplicated'
                    }
                }
            },
            {
                'ChannelName': 'images',
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': 'S3Prefix',
                        'S3Uri': images_s3uri,
                        'S3DataDistributionType': 'FullyReplicated'
                    }
                }
            },
            {
                'ChannelName': 'labels',
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': 'S3Prefix',
                        'S3Uri': labels_s3uri,
                        'S3DataDistributionType': 'FullyReplicated'
                    }
                }
            }
    
        ],
        OutputDataConfig = {
            'S3OutputPath': output_s3uri
        },
        ResourceConfig={
            'InstanceType': instance_type,
            'InstanceCount': instance_count,
            'VolumeSizeInGB': volume_size_in_gb
        },
        StoppingCondition={
            'MaxRuntimeInSeconds': 86400
        },
        EnableNetworkIsolation = False,
        EnableInterContainerTrafficEncryption = False,
        EnableManagedSpotTraining = False,
        Tags = tags
    )

    print(response)
    return response
