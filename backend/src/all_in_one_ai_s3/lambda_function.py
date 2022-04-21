import json
import boto3
import traceback
from botocore.exceptions import ClientError


s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))
s3_resource = boto3.resource('s3')

def lambda_handler(event, context):
    print(event)
    
    try:
        s3uri = None
        if('s3uri' in event['queryStringParameters']):
            s3uri = event['queryStringParameters']['s3uri']
        page_size = 20
        if('page_size' in event['queryStringParameters']):
            page_size = int(event['queryStringParameters']['page_size'])
        page_num = 1
        if('page_num' in event['queryStringParameters']):
            page_num = int(event['queryStringParameters']['page_num'])
    
        if(s3uri != None):
            bucket, key = get_bucket_and_key(s3uri)
            type = check_s3_prefix(bucket, key)
            if(type == 0):
                paginator = s3_client.get_paginator("list_objects_v2")
                pages = paginator.paginate(Bucket = bucket, Prefix = key)
                payload = []
                index = 0
                for page in pages:
                    if('Contents' in page):
                        for content in page['Contents']:
                            filename = content['Key']
                            if(index >= ((page_num - 1) * page_size) and index < page_num * page_size):
                                payload.append({
                                        'httpuri': get_presigned_url(bucket, filename),
                                        'bucket': bucket,
                                        'key': filename
                                    })
                            index += 1
                print(payload)
                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'payload': payload,
                            'count': index
                        }
                    )
                }
            elif(type == 1):
                payload = get_presigned_url(bucket, key)
                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'payload': payload,
                            'count': 1
                        }
                    )
                }
        
        return {
            'statusCode': 200,
            'body': json.dumps(
                        {
                            'payload': [],
                            'count': 0
                        }
                    )
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
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

def check_s3_prefix(bucket, key):
    s3_bucket = s3_resource.Bucket(bucket)
    objs = list(s3_bucket.objects.filter(Prefix=key))
    if(len(objs) > 1):
        return 0
    elif(len(objs) == 1): 
        return 0 if objs[0].get()['ContentType'] == 'application/x-directory' else 1
    else:
        return -1
