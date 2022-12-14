import json
import boto3
import traceback
import sagemaker
from botocore.client import Config
import os

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
s3_resource = boto3.resource('s3')


if os.path.isfile('/tmp/cache'):
    cache = json.load(open('/tmp/cache', 'r'))
else:
    cache = {}


def lambda_handler(event, context):
    print(event)
    
    try:
        hypernetwork_s3uri = None
        if(event['queryStringParameters'] and 'hypernetwork_s3uri' in event['queryStringParameters']):
            hypernetwork_s3uri = event['queryStringParameters']['hypernetwork_s3uri']
        else:
            sagemaker_session = sagemaker.Session()
            bucket = sagemaker_session.default_bucket()
            hypernetwork_s3uri = 's3://{0}/stable-diffusion-webui/embeddings/'.format(bucket)

        page_size = 20
        if(event['queryStringParameters'] and 'page_size' in event['queryStringParameters']):
            page_size = int(event['queryStringParameters']['page_size'])

        page_num = 1
        if(event['queryStringParameters'] and 'page_num' in event['queryStringParameters']):
            page_num = int(event['queryStringParameters']['page_num'])

        index = 0
        num_directories = 0
        num_igonored = 0
        if(hypernetwork_s3uri != None):
            bucket, key = get_bucket_and_key(hypernetwork_s3uri)
            s3_bucket = s3_resource.Bucket(bucket)
            objs = list(s3_bucket.objects.filter(Prefix=key))
    
            payload = []
            for obj in objs:
                filename = obj.key[obj.key.rfind('/') + 1 : ]
                print(filename)
                
                if(filename.startswith('.')):
                    continue
                
                if(not filename.endswith('pt')):
                    num_igonored += 1
                    continue
                
                if(filename.find('.') == -1):
                    if(obj.get()['ContentType'].startswith('application/x-directory')):
                        num_directories += 1
                        continue
                
                if(index >= (page_num - 1) * page_size and index < page_num * page_size):
                    hypernetwork_name = obj.key[obj.key.rfind('/') + 1 : - 3]
                    download_s3files(bucket, obj.key, f'/tmp')
                    hash = model_hash(f'/tmp/{hypernetwork_name}.pt')
                    payload.append(f'{hypernetwork_name}({hash})')
                index += 1

            return {
                'statusCode': 200,
                'body': json.dumps(payload)
            }
        else: 
            return {
                'statusCode': 200,
                'body': json.dumps([])
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

def model_hash(filename):
    try:
        with open(filename, "rb") as file:
            import hashlib
            m = hashlib.sha256()

            file.seek(0x100000)
            m.update(file.read(0x10000))
            return m.hexdigest()[0:8]
    except FileNotFoundError:
        return 'NOFILE'

def download_s3files(bucket, key, path):
    print(bucket)
    print(key)
    print(path)
    response = s3_client.head_object(
        Bucket = bucket,
        Key =  key
    )
    obj_key = 's3://{0}/{1}'.format(bucket, key)
    if obj_key not in cache or cache[obj_key] != response['ETag']:
        filename = key[key.rfind('/') + 1 : ]
        print(filename)

        s3_client.download_file(bucket, key, os.path.join(path, filename))
        cache[obj_key] = response['ETag']

        json.dump(cache, open('/tmp/cache', 'w'))
