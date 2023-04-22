import json
import boto3
import traceback
from botocore.exceptions import ClientError
from botocore.client import Config

region_name = boto3.session.Session().region_name
s3_client = boto3.client('s3', region_name=region_name)
endpointUrl = s3_client.meta.endpoint_url
s3_client = boto3.client('s3', endpoint_url=endpointUrl, region_name=region_name)
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

        include_filters = []
        if('include_filters' in event['queryStringParameters']):
            include_filters = (event['queryStringParameters']['include_filters']).split(',')

        exclude_filters = []
        if('exclude_filters' in event['queryStringParameters']):
            exclude_filters = (event['queryStringParameters']['exclude_filters']).split(',')

        index = 0
        num_directories = 0
        num_igonored = 0
        if(s3uri != None):
            bucket, key = get_bucket_and_key(s3uri)
            s3_bucket = s3_resource.Bucket(bucket)
            objs = list(s3_bucket.objects.filter(Prefix=key))
    
            payload = []
            for obj in objs:
                filename = obj.key[obj.key.rfind('/') + 1 : ]
                print(filename)
                
                if(filename.startswith('.')):
                    num_igonored += 1
                    continue
                
                ignored = False
                for include_filter in include_filters:                    
                    if(filename.endswith(include_filter)):
                        break
                if(ignored):
                    num_igonored += 1
                    continue
                
                ignored = False
                for exclude_filter in exclude_filters:                    
                    if(filename.endswith(exclude_filter)):
                        ignored = True
                        break
                if(ignored):
                    num_igonored += 1
                    continue
                
                if(filename.find('.') == -1):
                    if(obj.get()['ContentType'].startswith('application/x-directory')):
                        num_directories += 1
                        continue
                
                if(index >= (page_num - 1) * page_size and index < page_num * page_size):
                    payload.append({
                        'httpuri': get_presigned_url(bucket, obj.key),
                        'bucket': bucket,
                        'key': obj.key
                    })
                index += 1

            return {
                'statusCode': 200,
                'body': json.dumps(
                    {
                        'payload': payload,
                        'count': len(objs) - num_directories - num_igonored
                    }
                )
            }
        else: 
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
          ExpiresIn=3600*12
        )
        print("Got presigned URL: {}".format(url))
    except ClientError as e:
        print(str(e))
        raise
    return url
