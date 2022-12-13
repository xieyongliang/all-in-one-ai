import json
import boto3
import tarfile
import zipfile
import traceback
from io import BytesIO
from datetime import date, datetime
from decimal import Decimal
from botocore.client import Config

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
greengrassv2_client = boto3.client('greengrassv2')

def lambda_handler(event, context):
    try:
        payload = event['body']
        print(payload)
        model_data_url = payload['model_data_url']
        component_template_artifact_url = payload['component_template_artifact_url']
        component_template_receipt_url = payload['component_template_receipt_url']
        component_data_url = payload['component_data_url']
        component_version = payload['component_version']
        
        generate_component_artifact(model_data_url, component_template_artifact_url, component_data_url)
        receipt = generate_component_receipt(component_template_receipt_url, component_version, component_data_url)
        
        response = greengrassv2_client.create_component_version(
            inlineRecipe=bytes(json.dumps(receipt), 'utf-8')
        )
        print(response)
        return {
            'statusCode': 200,
            'body': response['arn']
        }
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
        
def generate_component_receipt(component_template_receipt_url, component_version, component_data_url):
    first = component_template_receipt_url.find('/', 5)
    last = component_template_receipt_url.rfind('/') 
    s3_receipt_bucket = component_template_receipt_url[5: first]
    s3_receipt_file = component_template_receipt_url[last + 1 : ]
    s3_receipt_folder = component_template_receipt_url[first + 1 : last + 1]

    s3_object = s3_client.get_object(Bucket = s3_receipt_bucket, Key = f"{s3_receipt_folder}{s3_receipt_file}") 
    bytes = s3_object["Body"].read()

    payload = bytes.decode('utf8')
    receipt = json.loads(payload)
    receipt['ComponentVersion'] = component_version
    receipt['Manifests'][0]['Artifacts'][0]['Uri'] = component_data_url
    
    return receipt

def generate_component_artifact(model_data_url, component_template_artifact_url, component_data_url):
    first = model_data_url.find('/', 5)
    last = model_data_url.rfind('/') 
    s3_tar_bucket = model_data_url[5: first]
    s3_tar_file = model_data_url[last + 1 : ]
    s3_tar_folder = model_data_url[first + 1 : last + 1]
    s3_untar_folder = s3_tar_folder

    s3_object = s3_client.get_object(Bucket = s3_tar_bucket, Key = f"{s3_tar_folder}{s3_tar_file}") 
    bytes = s3_object["Body"].read()
    first = component_template_artifact_url.find('/', 5)
    last = component_template_artifact_url.rfind('/') 
    s3_zip_bucket = component_template_artifact_url[5: first]
    s3_zip_file = component_template_artifact_url[last + 1 : ]
    s3_zip_folder = component_template_artifact_url[first + 1 : last + 1]

    first = component_data_url.find('/', 5)
    last = component_data_url.rfind('/') 
    s3_output_bucket = component_data_url[5: first]
    s3_output_file = component_data_url[last + 1 : ]
    s3_output_folder = component_data_url[first + 1 : last + 1]
    
    pt_file = open('/mnt/efs/best.pt', 'wb')
    with tarfile.open(fileobj = BytesIO(bytes)) as tar:
        bytes = tar.extractfile("tutorial/weights/best.pt").read()
        pt_file.write(bytes)
        pt_file.close()
    
    s3_object = s3_client.get_object(Bucket = s3_zip_bucket, Key = f"{s3_zip_folder}{s3_zip_file}") 
    bytes = s3_object["Body"].read()

    zip_file = open('/mnt/efs/' + s3_zip_file, 'wb')
    zip_file.write(bytes)
    zip_file.close()
    
    zip = zipfile.ZipFile('/mnt/efs/' + s3_zip_file, 'a')
    zip.write('/mnt/efs/best.pt', 'models/best.pt')
    zip.close()
    
    bytes = open('/mnt/efs/' + s3_zip_file, 'rb')
    response = s3_client.put_object( 
        Body=bytes,
        Bucket=s3_output_bucket, 
        Key=f'{s3_output_folder}{s3_output_file}') 

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")