import json
import urllib.parse
import boto3
import uuid

s3 = boto3.client('s3')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        filename = '/tmp/{0}'.format(str(uuid.uuid4()))
        response = s3.download_file(Bucket=bucket, Key=key, Filename=filename)
        print(open(filename,'r').read())

    except Exception as e:
        print(e)
        print('Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(key, bucket))
        raise e
              