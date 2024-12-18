import json
import boto3
import helper
import random
import string
import uuid
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/create_pipeline_helper_lambda_arn')

ddbh = helper.ddb_helper({'table_name': pipeline_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])
        
        industrial_model = request['industrial_model']
        model_algorithm = request['model_algorithm']
        pipeline_name = request['pipeline_name']
        pipeline_type = request['pipeline_type']
        script_mode = request['script_mode']
        
        if(script_mode or pipeline_type == '0' or pipeline_type == '1' or pipeline_type == '2' or pipeline_type == '3'):
            request['role'] = role_arn
            request['lambda_arn'] = lambda_arn
            subfix = ''.join(random.sample(string.ascii_lowercase + string.digits, 6))
            genearted_name = '{0}-{1}'.format(pipeline_name, subfix)
            if('model_name' not in request or request['model_name'] == ''):
                request['model_name'] = genearted_name
            if('endpoint_name' not in request or request['endpoint_name'] == ''):
                request['endpoint_name'] = genearted_name 
            request['endpoint_config_name'] = request['endpoint_name']
            request['model_package_group_inference_instances'] = request['endpoint_instance_type']

            pipeline_id = uuid.uuid4().hex
            request['pipeline_id'] = pipeline_id
        
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_pipeline',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : request})
            )
    
            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)

                if(payload['statusCode'] == 200):             
                    params = {}
                    params['pipeline_execution_arn'] = payload['body'][1 : len(payload['body']) - 1]
                    params['industrial_model'] = industrial_model
                    params['model_algorithm'] = model_algorithm
                    params['pipeline_name'] = pipeline_name
                    params['pipeline_type'] = pipeline_type
                    params['pipeline_id'] = pipeline_id
                    params['model_name'] = request['model_name']
                    params['endpoint_config_name'] = request['endpoint_config_name']
                    params['endpoint_name'] = request['endpoint_name']
                    params['script_mode'] = script_mode

                    print(params)
                    
                    item = ddbh.put_item(params)
                
                return {
                    'statusCode': response['StatusCode'],
                    'body': response['Payload'].read().decode('utf-8')
                }
            else:
                return {
                    'statusCode': 400,
                    'body': response['FunctionError']
                }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported pipeline type'
            }
    else:    
        pipeline_execution_arn = None
        if event['queryStringParameters'] != None:
            if('pipeline_execution_arn' in event['queryStringParameters']):
                pipeline_execution_arn = event['queryStringParameters']['pipeline_execution_arn']
            
        industrial_model = None
        if event['queryStringParameters'] != None:
            if 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']
        
        try:    
            if pipeline_execution_arn == None:
                if industrial_model != None:
                    items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                else:
                    items = ddbh.scan()
            else:
                params = {}
                params['pipeline_execution_arn'] = pipeline_execution_arn
                params['industrial_model'] = industrial_model
                print(params)
                
                item = ddbh.get_item(params)
        
                if item == None:
                    items = []
                else:
                    items = [ item ]

            result = []
            for item in items:
                if(process_item(item, industrial_model)):
                    result.append(item)


            return {
                'statusCode': 200,
                'body': json.dumps(result, default = defaultencode)
            }
        
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }

def process_item(item, industrial_model):
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
            payload = response['Payload'].read().decode('utf-8')
            payload = json.loads(payload)
            if(payload['statusCode'] == 200):
                item.update(json.loads(payload['body']))
                return True
            else:
                return False
        else:
            traceback.print_exc()
            return False
        
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + ' is not JSON serializable')