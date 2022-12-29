import os
import io
import sys
import sagemaker
from helper import ddb_helper
import traceback
import boto3
from botocore.exceptions import ClientError
import tarfile

def upload_s3file(s3uri, file_path, file_name):
    s3_client = boto3.client('s3')

    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]

    binary = io.BytesIO(open(file_path, 'rb').read())
    key = key + file_name
    try:
        s3_client.upload_fileobj(binary, bucket, key)
    except ClientError as e:
        print(e)
        return False
    return True

def create_tarfile(output_filename, source_dir, extensions):
    with tarfile.open(output_filename, "w:gz") as tar:
        for file in os.listdir(source_dir):
            for extension in extensions:
                if file.endswith(extension):
                    print(file)
                    tar.add(os.path.join(source_dir, file), arcname=file)
try:
    path = sys.argv[1]

    bucket = sagemaker.Session().default_bucket()
    
    for file in os.listdir(path):
        if file.endswith('.ckpt') or file.endswith('.yaml'):
            upload_s3file(
                's3://{0}/stable-diffusion-webui/models/'.format(bucket),
                os.path.join(path, file),
                file
            )
    
    create_tarfile('model.tar.gz', path, ['ckpt', 'yaml'])

    upload_s3file(
        's3://{0}/stable-diffusion-webui/assets/'.format(bucket), 
        'model.tar.gz', 
        'model.tar.gz'
     )
    
except Exception as e:
    traceback.print_exc()
    print(e)
