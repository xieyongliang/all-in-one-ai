import boto3
import traceback

sagemaker_client = boto3.client('sagemaker')

def lambda_handler(event, context):
    print(event)
    
    try:
        transform_job_name = event['body']['transform_job_name']
        model_name = event['body']['model_name']
        max_concurrent_transforms = event['body']['max_concurrent_transforms']
        invocations_timeout_in_seconds = event['body']['invocations_timeout_in_seconds']
        invocations_max_retries = event['body']['invocations_max_retries']
        max_payload_in_mb = event['body']['max_payload_in_mb']
        batch_strategy = event['body']['batch_strategy']
        environment = event['body']['environment'] if('environment' in event['body']) else {}
        s3_data_type = event['body']['s3_data_type']
        input_s3uri = event['body']['input_s3uri']
        content_type = event['body']['content_type']
        compression_type = event['body']['compression_type']
        split_type = event['body']['split_type']   
        output_s3uri = event['body']['output_s3uri']
        accept = event['body']['accept']
        assemble_with = event['body']['assemble_with']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        input_filter = event['body']['input_filter']
        output_filter = event['body']['output_filter']
        join_source = event['body']['join_source']    
        tags = event['body']['tags'] if('tags' in event['body']) else []
        
        response = sagemaker_client.create_transform_job(
            TransformJobName = transform_job_name,
            ModelName = model_name,
            MaxConcurrentTransforms = max_concurrent_transforms,
            ModelClientConfig = {
                'InvocationsTimeoutInSeconds': invocations_timeout_in_seconds,
                'InvocationsMaxRetries': invocations_max_retries
            },
            MaxPayloadInMB = max_payload_in_mb,
            BatchStrategy = batch_strategy,
            Environment = environment,
            TransformInput = {
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': s3_data_type,
                        'S3Uri': input_s3uri
                    }
                },
                'ContentType': content_type,
                'CompressionType': compression_type,
                'SplitType': split_type
            },
            TransformOutput = {
                'S3OutputPath': output_s3uri,
                'Accept': accept,
                'AssembleWith': assemble_with,        
            },
            TransformResources = {
                'InstanceType': instance_type,
                'InstanceCount': instance_count
            },
            DataProcessing = {
                'InputFilter': input_filter,
                'OutputFilter': output_filter,
                'JoinSource': join_source
            },
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
