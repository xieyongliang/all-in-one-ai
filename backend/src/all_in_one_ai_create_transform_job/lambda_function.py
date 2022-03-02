import boto3

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    transform_job_name = event['body']['transform_job_name']
    model_name = event['body']['model_name']
    s3_data_type = event['body']['s3_data_type']
    content_type = event['body']['content_type']
    instance_type = event['body']['instance_type']
    instance_count = event['body']['instance_count']
    max_concurrent_transforms = event['body']['max_concurrent_transforms']
    input_s3uri = event['body']['input_s3uri']
    output_s3uri = event['body']['output_s3uri']
    tags = event['body']['tags'] if('tags' in event['body']) else []
    
    response = sagemaker_runtime_client.create_transform_job(
        TransformJobName = transform_job_name,
        ModelName = model_name,
        MaxConcurrentTransforms = max_concurrent_transform,
        TransformInput={
            'DataSource': {
                'S3DataSource': {
                    'S3DataType': s3_data_type,
                    'S3Uri': input_s3uri
                }
            },
            'ContentType': content_type,
        },
        TransformOutput={
            'S3OutputPath': output_s3uri
        },
        TransformResources={
            'InstanceType': instance_type,
            'InstanceCount': instance_count
        }
    )

    return response
