import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key

algorithm_name = 'yolov5'

ssmh = helper.ssm_helper()
custom_table = ssmh.get_parameter('/all_in_one_ai/config/meta/custom_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/sagemaker/image'.format(algorithm_name))

ddbh = helper.ddb_helper({'table_name': custom_table})
lambda_client = boto3.client('lambda', config = cfg)
s3_client = boto3.client('s3')
s3_resource = boto3.resource('s3')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        payload = json.loads(event['body'])
        data_yaml = payload['data_yaml']
        model_name = payload['model_name']
        
        weights_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/weights_s3uri'.format(algorithm_name, 'default'))
        cfg_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/cfg_s3uri'.format(algorithm_name, 'default'))
    
        data_yaml_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/weights_s3uri'.format(algorithm_name, 'default'))
        left1 = data_yaml_s3uri.find('/', 5)
        right1 = data_yaml_s3uri.rfind('/')
        right2 = data_yaml_s3uri.rfind('/', 0, right1 - 1)
        right3 = data_yaml_s3uri.rfind('/', 0, right2 - 1)
        s3_bucket = data_yaml_s3uri[5 : left1]
        old_key = data_yaml_s3uri[left1 + 1 : ]
        new_key = data_yaml_s3uri[left1 + 1 : right3] + '/' + model_name + '/' + data_yaml_s3uri[right2 + 1 :]
        s3bucketcopy(s3_bucket, old_key, new_key)
    
        data_yaml_s3uri = f'{weights_s3uri}/data.yaml'
        first = data_yaml_s3uri.find('/', 5)
        s3_bucket = data_yaml_s3uri[5 : first]
        s3_key = data_yaml_s3uri[first + 1: ]
        
        response = s3_client.put_object( 
            Body=bytes(data_yaml, encoding='utf8'),
            Bucket=s3_output_bucket, 
            Key=f'{s3_bucket}{s3_key}'
        ) 
    
        if(payload['weights_s3uri'] == ''):
            payload['weights_s3uri'] = weights_s3uri
        if(payload['cfg_s3uri'] == ''):
            payload['cfg_s3uri'] = cfg_s3uri
        
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_training_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : json.dumps(payload), 'httpMethod': 'POST'})
        )
        print(response)
        if('FunctionError' in response):
            return {
                'statusCode': 400,
                'body': response['FunctionError']
            }

def s3bucketcopy(s3_bucket,old_key, new_key):
    try:
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket = s3_candidate_bucket,Prefix=old)
        for page in pages:
            if(keycount > 0):
                for key in page['Contents']:
                    file = key['Key']
                    try:
                        output = file.split(old_key)
                        newfile = new_key + output[1]
                        input_source = {'Bucket': s3_bucket,'Key' : file }
                        s3_resource.Object(s3_bucket,newfile).copy_from(CopySource=input_source)
                    except ClientError as e:
                        print(str(e))
            else:
                print('No matching records')
    except ClientError as e:
        print(str(e))
    else:
        print('Operatio completed')
