import json
import boto3
import helper
import random
import string
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime, timedelta

model_name = 'yolov5'

ssmh = helper.ssm_helper()
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/create_pipeline_helper_lambda_arn')
training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/sagemaker/image'.format(model_name))

ddbh = helper.ddb_helper({'table_name': pipeline_table})

ddbh2 = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        case_name = request['case_name']
        weights_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/weights_s3uri'.format(model_name, case_name))
        cfg_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/cfg_s3uri'.format(model_name, case_name))

        request['role'] = role_arn
        request['lambda_arn'] = lambda_arn
        request['training_image'] = training_image
        subfix = ''.join(random.sample(string.ascii_lowercase + string.digits, 6))
        request['model_name'] = '{0}-{1}'.format(request['pipeline_name'], subfix) 
        request['endpoint_name'] = '{0}-{1}'.format(request['pipeline_name'], subfix) 
        request['endpoint_config_name'] = '{0}-{1}'.format(request['pipeline_name'], subfix)
        request['api_name'] = '{0}-{1}'.format(request['pipeline_name'], subfix)
        request['model_package_group_inference_instances'] = request['endpoint_instance_type']
        if(request['training_job_weights_s3uri'] == ''):
            request['training_job_weights_s3uri'] = weights_s3uri
        if(request['training_job_cfg_s3uri'] == ''):
            request['training_job_cfg_s3uri'] = cfg_s3uri

        
        api_env = {
            'Variables': {
                request['endpoint_name_{0}'.format(model_name)] : request['endpoint_name']
            }
        }
        request['api_env'] = json.dumps(api_env)
    
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_create_pipeline',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : request})
        )

        if('FunctionError' not in response):
            params = {}
            payload = response["Payload"].read().decode("utf-8")
            params['pipeline_execution_arn'] = payload[1 : len(payload) - 1]
            params['pipeline_name'] = request['pipeline_name']
            params['case_name'] = request['case_name']
            params['model_name'] = request['model_name']
            params['endpoint_config_name'] = request['endpoint_config_name']
            params['endpoint_name'] = request['endpoint_name']
            params['api_name'] = request['api_name']
            
            ddbh.put_item(params)
            
            return {
                'statusCode': response['StatusCode'],
                'body': response["Payload"].read().decode("utf-8")
            }
        else:
            return {
                'statusCode': 400,
                'body': response['FunctionError']
            }
    else:    
        pipeline_execution_arn = None
        if event['queryStringParameters'] != None:
            if('pipeline_execution_arn' in event['queryStringParameters']):
                pipeline_execution_arn = event['queryStringParameters']['pipeline_execution_arn']
            
        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']
        
        try:    
            if pipeline_execution_arn == None:
                if case_name != None:
                    items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name))
                else:
                    items = ddbh.scan()
                
                for item in items:
                    process_item(item, case_name)

                return {
                    'statusCode': 200,
                    'body': json.dumps(items, default = defaultencode)
                }
            else:
                params = {}
                params['pipeline_execution_arn'] = pipeline_execution_arn
                params['case_name'] = case_name
                print(params)
                
                item = ddbh.get_item(params)
        
                process_item(item, case_name)
        
                return {
                   'statusCode': 200,
                    'body': json.dumps(item, default = defaultencode)
                }
        
        except Exception as e:
            print(e)
            return {
                'statusCode': 400,
                'body': str(e)
            }

def process_item(item, case_name):
    print(item)
    if(item == None):
        raise Exception('Endpoint item is None')
    else:    
        pipeline_execution_arn = item['pipeline_execution_arn']
        
        request = {
            'pipeline_execution_arn' : pipeline_execution_arn
        }
        
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_pipeline_execution',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : request})
        )
    
        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)
            
            item['execution_status'] = payload['PipelineExecutionStatus']
            item['creation_time'] = payload['CreationTime']
            item['last_modified_time'] = payload['LastModifiedTime']
            
            request = {
                'model_name': item['model_name']
            }
            if('training_job_name' not in item):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_describe_model',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body' : request})
                )
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    payload = json.loads(payload)
                    model_package_name = payload['Containers'][0]['ModelPackageName']
                    
                    request = {
                        'model_package_arn': model_package_name
                    }
                    response = lambda_client.invoke(
                        FunctionName = 'all_in_one_ai_model_package',
                            InvocationType = 'RequestResponse',
                        Payload=json.dumps({'queryStringParameters' : request, 'httpMethod': 'GET'})
                    )
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    payload = json.loads(payload['body'])
                    model_data_url = payload['InferenceSpecification']['Containers'][0]['ModelDataUrl']
                    strs = model_data_url.split('/')
                    training_job_name = strs[len(strs) - 3]
                    item['training_job_name'] = training_job_name
    
                    params = {}
                    params['training_job_name'] = training_job_name
                    params['case_name'] = case_name
                    ddbh2.put_item(params)
    
                    params = {}
                    params['training_job_name'] = training_job_name
    
                    key = {
                        'pipeline_execution_arn': pipeline_execution_arn,
                        'case_name': case_name
                    }
                    
                    ddbh.update_item(key, params)
                
                else:
                    raise Exception(response["FunctionError"])
            
            item.update(payload)

        else:
            raise Exception(response["FunctionError"])
        
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")