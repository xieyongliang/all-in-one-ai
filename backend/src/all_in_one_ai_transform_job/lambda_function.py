import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
transform_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/transform_job_table')
ddbh = helper.ddb_helper({'table_name': transform_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
            
            industrial_model = request['industrial_model']
        
            payload = {}
            payload['transform_job_name'] = request['transform_job_name']
            payload['model_name'] = request['model_name']
            payload['max_concurrent_transforms'] = request['max_concurrent_transforms']
            payload['invocations_timeout_in_seconds'] = request['invocations_timeout_in_seconds']
            payload['invocations_max_retries'] = request['invocations_max_retries']
            payload['max_payload_in_mb'] = request['max_payload_in_mb']
            payload['batch_strategy'] = request['batch_strategy']
            payload['environment'] = request['environment'] if('environment' in event) else {}            
            payload['s3_data_type'] = request['s3_data_type']
            payload['input_s3uri'] = request['input_s3uri']
            payload['content_type'] = request['content_type']
            payload['compression_type'] = request['compression_type']
            payload['split_type'] = request['split_type']  
            payload['output_s3uri'] = request['output_s3uri']
            payload['accept'] = request['accept']
            payload['assemble_with'] = request['assemble_with']
            payload['instance_type'] = request['instance_type']
            payload['instance_count'] = request['instance_count']
            payload['input_filter'] = request['input_filter']
            payload['output_filter'] = request['output_filter']
            payload['join_source'] = request['join_source']
            payload['tags'] = request['tags'] if('tags' in event) else []
            
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_transform_job',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : payload})
            )

            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                if(payload['statusCode'] == 200):
                    params = {}
                    params['transform_job_name'] = request['transform_job_name']
                    params['industrial_model'] = industrial_model
                    ddbh.put_item(params)                
                return {
                    'statusCode': payload['statusCode'],
                    'body': json.dumps(payload['body'])
                }
            else:
                return {
                    'statusCode': 400,
                    'body': response["FunctionError"]
                }
        
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
        
    else:
        transform_job_name = None
        if event['pathParameters'] != None:
            if 'transform_job_name' in event['pathParameters']:
                transform_job_name = event['pathParameters']['transform_job_name']

        industrial_model = None
        if event['queryStringParameters'] != None:
            if 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']

        action = None
        if event['queryStringParameters'] != None and 'action' in event['queryStringParameters']:
                action = event['queryStringParameters']['action']

        try:
            print(transform_job_name)
            print(industrial_model)
            print(action)

            if(action == 'attach' and event['httpMethod'] == 'GET'):
                params = {}
                params['transform_job_name'] = transform_job_name
                params['industrial_model'] = industrial_model
                ddbh.put_item(params)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(params)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                key = {
                    'transform_job_name': transform_job_name,
                    'industrial_model': industrial_model
                }
                ddbh.delete_item(key)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(key)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_transform_jobs',
                    InvocationType = 'RequestResponse',
                    Payload=''
                )
            
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    
                    return {
                        'statusCode': payload['statusCode'],
                        'body': payload['body']
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
            elif (action == 'list' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_transform_jobs',
                    InvocationType = 'RequestResponse',
                    Payload=''
                )
            
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    
                    return {
                        'statusCode': payload['statusCode'],
                        'body': payload['body']
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
            else:
                if transform_job_name == None:
                    if industrial_model != None:
                        items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                    else:
                        items = ddbh.scan()
                else:
                    if industrial_model == None:
                        items = ddbh.scan(FilterExpression=Key('transform_job_name').eq(transform_job_name))
                    else:
                        params = {}
                        params['transform_job_name'] = transform_job_name
                        params['industrial_model'] = industrial_model
                        item = ddbh.get_item(params)

                        if item == None:
                            items = []
                        else:
                            items = [ item ]

                result = []
                for item in items:
                    if(process_item(item, action)):
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

def process_item(item, action):
    payload = {'transform_job_name': item['transform_job_name']}
    if(action == 'stop'):
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_stop_transform_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )
    else:
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_transform_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

    if('FunctionError' not in response):
        payload = response["Payload"].read().decode("utf-8")
        payload = json.loads(payload)
        if(payload['statusCode'] == 200):
            payload = json.loads(payload['body'])
            item.clear()
            item.update(payload)
            return True
        else:
            print(payload['body'])
            return False
    else:
        print(response['FunctionError'])
        return False

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
