export const InferenceSample = `
    endpoint_name = event['queryStringParameters']['endpoint_name']
    content_type = event['headers']['content-type']        
    payload = event['body']
                    
    if content_type == 'application/json':
        body = payload
    else:
        body = base64.b64decode(payload)
    
    response = sagemaker_runtime_client.invoke_endpoint(
        EndpointName=endpoint_name,
        ContentType=content_type,
        Body=body)
                                
    result = json.loads(response["Body"].read())
`
export const TransformSample = `
request = event['body']
    
transformjob_name = request['transformjob_name']
model_name = request['model_name']
data_type = request['data_type']
content_type = request['content_type']
instance_type = request['instance_type']
instance_count = request['instance_count']
max_concurrent_transforms = request['max_concurrent_transforms']
s3_input_uri = request['s3_input_uri']
s3_output_uri = request['s3_output_uri']

response = sagemaker_runtime_client.create_transform_job(
    TransformJobName = transformjob_name,
    ModelName = model_name,
    MaxConcurrentTransforms = max_concurrent_transform,
    TransformInput={
        'DataSource': {
            'S3DataSource': {
                'S3DataType': data_type,
                'S3Uri': s3_input_uri
            }
        },
        'ContentType': content_type,
    },
    TransformOutput={
        'S3OutputPath': s3_output_uri
    },
    TransformResources={
        'InstanceType': instance_type,
        'InstanceCount': instance_count
    }
)
`