import json
import os
import helper
import boto3
from botocore.exceptions import ClientError
from elasticsearch import Elasticsearch
import traceback

sqs_resource = boto3.resource('sqs')
s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))

def lambda_handler(event, context):
    print(event)
    
    try:
        industrial_model = event['body']['industrial_model']
        model_samples = event['body']['model_samples']
        index = industrial_model

        queue = sqs_resource.get_queue_by_name(QueueName='all_in_one_ai_sqs')
        bucket, key = get_bucket_and_key(model_samples)
        s3uris = get_s3_images(bucket, key)
        for s3uri in s3uris:
            response = queue.send_message(
                MessageBody = json.dumps(
                    {
                        's3uri': s3uri, 
                        'index': index
                    }
                )
            )
        return {
            'statusCode': 200,
            'body': len(s3uris)
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

def get_s3_images(bucket, key):
    s3uris = []
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket = bucket, Prefix = key)
        for page in pages:
            keycount = page['KeyCount']
            if(keycount > 0):
                for key in page['Contents']:
                    file = key['Key']
                    print(file)
                    if(file.endswith('.png') or file.endswith('.jpg') or file.endswith('.jpeg')):
                        s3uris.append('s3://{0}/{1}'.format(bucket, file))
            else:
                print('No matching records')
        return s3uris
    except ClientError as e:
        print(str(e))
    else:
        print('Operatio completed')
