import helper
import traceback
import json
from boto3.dynamodb.conditions import Key
import sagemaker
import boto3
from botocore.client import Config

sagemaker_session = sagemaker.Session()

sd_model_table = 'all_in_one_ai_sd_model'
ddbh = helper.ddb_helper({'table_name': sd_model_table})

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))

def lambda_handler(event, context):
    print(event)

    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)

            bucket = sagemaker_session.default_bucket()
            
            dreambooth_config_id = None
            if event['queryStringParameters'] and 'dreambooth_config_id' in event['queryStringParameters']:
                dreambooth_config_id = event['queryStringParameters']['dreambooth_config_id']

            if dreambooth_config_id:
                dreambooth_config_s3uri = None
                if event['queryStringParameters'] and 'dreambooth_config_s3uri' in event['queryStringParameters']:
                    dreambooth_config_s3uri = event['queryStringParameters']['dreambooth_config_s3uri']
                else:
                    dreambooth_config_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth-config/'.format(bucket)

                bucket, key = get_bucket_and_key('{0}{1}.json'.format(dreambooth_config_s3uri, dreambooth_config_id))
                s3_client.put_object(
                    Bucket=bucket,
                    Key=key,
                    Body=json.dumps(request).encode('utf-8')
                )
            else:
                items = request['items']

                for item in items:
                    ddbh.put_item(item)

            return {
                'statusCode': 200
            }
        elif event['httpMethod'] == 'GET':
            module = None
            if event['queryStringParameters'] and 'module' in event['queryStringParameters']:
                module = event['queryStringParameters']['module']

            if module:
                bucket = sagemaker_session.default_bucket()
                if module == 'dreambooth':
                    if 'dreambooth_s3uri' in event['queryStringParameters']:
                        dreambooth_s3uri = event['queryStringParameters']['dreambooth_s3uri']
                    else:
                        dreambooth_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth/'.format(bucket)

                    bucket, key = get_bucket_and_key(dreambooth_s3uri)

                    response = s3_client.list_objects_v2(
                        Bucket=bucket,
                        Prefix=key,
                        Delimiter='/'
                    )

                    print(response)
                    items = []
                    if response['KeyCount'] > 0:
                        for item in response['CommonPrefixes']:
                            items.append(item['Prefix'])

                    return {
                        'statusCode': 200,
                        'body': json.dumps(items)
                    }

                if module == 'lora':
                    if 'lora_s3uri' in event['queryStringParameters']:
                        lora_s3uri = event['queryStringParameters']['lora_s3uri']
                    else:
                        lora_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth/'.format(bucket)


                    bucket, key = get_bucket_and_key(lora_s3uri)

                    response = s3_client.list_objects_v2(
                        Bucket=bucket,
                        Prefix=key,
                        Delimiter='/'
                    )

                    print(response)
                    items = []
                    if response['KeyCount'] > 0:
                        for item in response['CommonPrefixes']:
                            items.append(item['Prefix'])

                    return {
                        'statusCode': 200,
                        'body': json.dumps(items)
                    }

                if module == 'dreambooth_params':
                    dreambooth_model = event['queryStringParameters']['dreambooth_model']
                    if 'dreambooth_s3uri' in event['queryStringParameters']:
                        dreambooth_s3uri = event['queryStringParameters']['dreambooth_s3uri']
                    else:
                        dreambooth_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth/'.format(bucket)

                    dreambooth_config_s3uri = '{0}{1}/db_config.json'.format(dreambooth_s3uri, dreambooth_model)

                    bucket, key = get_bucket_and_key(dreambooth_config_s3uri)

                    response = s3_client.get_object(
                        Bucket=bucket,
                        Key=key
                    )

                    print(response)
                    body = response['Body']
                    params = body.read().decode('utf-8')

                    return {
                        'statusCode': 200,
                        'body': params
                    }

                if module == 'dreambooth_config':
                    dreambooth_config_id = event['queryStringParameters']['dreambooth_config_id']
                    if 'dreambooth_config_s3uri' in event['queryStringParameters']:
                        dreambooth_config_s3uri = event['queryStringParameters']['dreambooth_config_s3uri']
                    else:
                        dreambooth_config_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth-config/'.format(bucket)

                    dreambooth_config_s3uri = '{0}{1}.json'.format(dreambooth_s3uri, dreambooth_config_id)

                    bucket, key = get_bucket_and_key(dreambooth_config_s3uri)

                    response = s3_client.get_object(
                        Bucket=bucket,
                        Key=key
                    )

                    print(response)
                    body = response['Body']
                    params = body.read().decode('utf-8')

                    return {
                        'statusCode': 200,
                        'body': params
                    }


            endpoint_name = None
            if event['queryStringParameters'] and 'endpoint_name' in event['queryStringParameters']:
                endpoint_name = event['queryStringParameters']['endpoint_name']

            if endpoint_name:
                items = ddbh.scan(FilterExpression=Key('endpoint_name').eq(endpoint_name))
            else:
                items = ddbh.scan()

            print(items)

            return {
                'statusCode': 200,
                'body': json.dumps(items)
            }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP Method'                
            }
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key