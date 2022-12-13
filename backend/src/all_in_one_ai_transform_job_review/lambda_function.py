import json
import boto3
import helper
from botocore.exceptions import ClientError
from botocore.client import Config

ssmh = helper.ssm_helper()
transform_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/transform_job_table')

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    transform_job_name = event['pathParameters']['transform_job_name']
    page_size = 20
    if('page_size' in event['queryStringParameters']):
        page_size = int(event['queryStringParameters']['page_size'])
    page_num = 1
    if('page_num' in event['queryStringParameters']):
        page_num = int(event['queryStringParameters']['page_num'])
    
    request = {
        'transform_job_name' : transform_job_name
    }
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_describe_transform_job',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body' : request})
    )
    
    if('FunctionError' not in response):
        payload = response['Payload'].read().decode('utf-8')
        payload = json.loads(payload)
        payload = json.loads(payload['body'])
        
        input_s3uri = payload['TransformInput']['DataSource']['S3DataSource']['S3Uri']
        output_s3uri = payload['TransformOutput'] ['S3OutputPath']

        input_bucket, input_key = get_bucket_and_key(input_s3uri)
        output_bucket, output_key = get_bucket_and_key(output_s3uri)
    
        input = []
        output = []
        
        index = 0
        paginator = s3_client.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket = output_bucket, Prefix = output_key)
        for page in pages:
            if('Contents' in page):
                for content in page['Contents']:
                    output_filename = content['Key']
                    print(output_filename)
                    output_filename = output_filename[output_filename.rfind('/') + 1 : ]
                    print(output_filename)
                    input_filename = output_filename[0 : output_filename.rfind('.')]
                    print(input_filename)
                    if(index >= (page_num * page_size) and index < (page_num + 1) * page_size):
                        input.append(get_presigned_url(input_bucket, input_key  + input_filename))
                        output.append(get_presigned_url(output_bucket, output_key  + output_filename))
                    index += 1
                    
        return {
            'statusCode': 200,
            'body': json.dumps({"input": input, "output": output, "count": index})
        }
    else:
        return {
            'statusCode': 400,
            'body': response['FunctionError']
        }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
    
def get_presigned_url(bucket, key):
    try:
        url = s3_client.generate_presigned_url(
          ClientMethod='get_object',
          Params={'Bucket': bucket, 'Key': key}, 
          ExpiresIn=1000
        )
        print("Got presigned URL: {}".format(url))
    except ClientError as e:
        print(str(e))
        raise
    return url
