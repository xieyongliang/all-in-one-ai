import os
import io
import sys
import sagemaker
from helper import ddb_helper
import traceback
import boto3
from botocore.exceptions import ClientError
import tarfile

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
    
    ddbh = ddb_helper({'table_name': 'all_in_one_ai_sd_model'})

    if not ddbh.table_exist():
        ddbh.create_table(
            {
                'key_schema': [
                    {
                        'AttributeName': 'model_name',
                        'KeyType': 'HASH'
                    }
                ],
                'attribute_definitions': [
                    {
                        'AttributeName': 'model_name',
                        'AttributeType': 'S'
                    }
                ],
                'provisioned_throughput': {
                    'ReadCapacityUnits': 1,
                    'WriteCapacityUnits': 1
                }
            }
        )

    items = ddbh.scan()
    for item in items:
        key = {
            'model_name': item['model_name']
        }
        ddbh.delete_item(key)

    for file in os.listdir(path):
        if file.endswith('.ckpt'):
            hash = model_hash(os.path.join(path, file))
            item = {}
            item['model_name'] = file
            item['config'] = '/opt/ml/code/stable-diffusion-webui/repositories/stable-diffusion/configs/stable-diffusion/v1-inference.yaml'
            item['filename'] = '/opt/ml/code/stable-diffusion-webui/models/Stable-diffusion/{0}'.format(file)
            item['hash'] = hash
            item['title'] = '{0} [{1}]'.format(file, hash)
            ddbh.put_item(item)
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
