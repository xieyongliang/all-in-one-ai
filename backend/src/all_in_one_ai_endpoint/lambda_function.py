import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
endpoint_table = ssmh.get_parameter('/all_in_one_ai/config/meta/endpoint_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': endpoint_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
            print(request)

            industrial_model = request['industrial_model']

            payload = {}
            payload['endpoint_name'] = request['endpoint_name']
            if('endpoint_config_name' in request):
                payload['endpoint_config_name'] = request['endpoint_config_name']
            payload['model_name'] = request['model_name']
            payload['instance_type'] = request['instance_type']
            payload['initial_instance_count'] = request['initial_instance_count']
            payload['initial_variant_weight'] = request['initial_variant_weight']
            if('tags' in request):
                payload['tags'] = request['tags']

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_endpoint',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : payload})
            )

            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                if(payload['statusCode'] == 200):
                    params = {}
                    params['endpoint_name'] = request['endpoint_name']
                    params['industrial_model'] = industrial_model
                    ddbh.put_item(params)
                return {
                    'statusCode': payload['statusCode'],
                    'body': json.dumps(payload['body'])
                }
            else:
                return {
                    'statusCode': 400,
                    'body': response['FunctionError']
                }

        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
    
    else: 
        endpoint_name = None
        if event['pathParameters'] != None and 'endpoint_name' in event['pathParameters']:
                endpoint_name = event['pathParameters']['endpoint_name']
    
        industrial_model = None
        if event['queryStringParameters'] !=None and 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']
        
        action = None
        if event['queryStringParameters'] !=None and 'action' in event['queryStringParameters']:
                action = event['queryStringParameters']['action']
                
        try:
            print(endpoint_name)
            print(industrial_model)
            print(action)
            
            if(action == 'attach' and event['httpMethod'] == 'GET'):
                params = {}
                params['endpoint_name'] = endpoint_name
                params['industrial_model'] = industrial_model
                ddbh.put_item(params)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(params)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                key = {
                    'endpoint_name': endpoint_name,
                    'industrial_model': industrial_model
                }
                ddbh.delete_item(key)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(key)
                }
            elif (action == 'list' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_endpoints',
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
                if endpoint_name == None:
                    if industrial_model != None:
                        items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                    else:
                        items = ddbh.scan()
                else:
                    if industrial_model == None:
                        items = ddbh.scan(FilterExpression=Key('endpoint_name').eq(endpoint_name))
                    else:
                        key = {
                            'endpoint_name': endpoint_name,
                            'industrial_model': industrial_model
                        }
                        item = ddbh.get_item(key)
                        if item == None:
                            items = []
                        else:
                            items = [ item ]
                
                result = []
                for item in items:
                    if (event['httpMethod'] == 'DELETE'):
                        if(process_delete_item(item)):
                            key = {
                                'endpoint_name': item['endpoint_name'],
                                'industrial_model': item['industrial_model']
                            }
                            ddbh.delete_item(key)
                            result.append(item)
                    else:
                        if(process_get_item(item)):
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
            
def process_get_item(item):
    payload = {'endpoint_name': item['endpoint_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_describe_endpoint',
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

def process_delete_item(item):
    payload = {'endpoint_name': item['endpoint_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_delete_endpoint',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body': payload})
    )

    if('FunctionError' not in response):
        payload = response["Payload"].read().decode("utf-8")
        payload = json.loads(payload)
        if(payload['statusCode'] == 200):
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