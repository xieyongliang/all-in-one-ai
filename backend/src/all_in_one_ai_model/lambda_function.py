from decimal import Decimal
import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()

model_table = ssmh.get_parameter('/all_in_one_ai/config/meta/model_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': model_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
            print(request)

            industrial_model = request['industrial_model']
            algorithm = request['model_algorithm']

            try: 
                inference_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/inference_image'.format(algorithm))
            except Exception as e:
                print(e)

            try: 
                model_data_url = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/artifact'.format(algorithm))
            except Exception as e:
                print(e)

            payload = {}
            payload['model_name'] = request['model_name']
            payload['role_arn'] = role_arn
            if('model_package_arn' in request):
                payload['model_package_arn'] = request['model_package_arn']
            else:
                payload['inference_image'] = request['inference_image']
                if('model_data_url' in request):
                    payload['model_data_url'] = request['model_data_url']
                payload['mode'] = request['mode']

                payload['inference_image']  = request['inference_image'] if(request['inference_image'] != '') else inference_image
                payload['model_data_url'] = request['model_data_url'] if(request['model_data_url'] != '') else model_data_url                    

            if('model_environment' in request):
                payload['model_environment'] = json.loads(request['model_environment'])
            if('tags' in request):
                payload['tags'] = request['tags']

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_model',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body': payload})
            )

            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                
                if(payload['statusCode'] == 200):
                    params = {}
                    params['model_name'] = request['model_name']
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
        model_name = None
        if event['pathParameters'] != None and 'model_name' in event['pathParameters']:
                model_name = event['pathParameters']['model_name']
    
        industrial_model = None
        if event['queryStringParameters'] != None and 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']

        action = None
        if event['queryStringParameters'] !=None and 'action' in event['queryStringParameters']:
                action = event['queryStringParameters']['action']
        
        try:
            print(model_name)
            print(industrial_model)
            print(action)
            
            if(action == 'attach' and event['httpMethod'] == 'GET'):
                params = {}
                params['model_name'] = model_name
                params['industrial_model'] = industrial_model
                ddbh.put_item(params)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(params)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                key = {
                    'model_name': model_name,
                    'industrial_model': industrial_model
                }
                ddbh.delete_item(key)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(key)
                }
            elif (action == 'list' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_models',
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
                if model_name == None:
                    if industrial_model != None:
                        items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                    else:
                        items = ddbh.scan()
                else:
                    if industrial_model == None:
                        items = ddbh.scan(FilterExpression=Key('model_name').eq(model_name))
                    else:
                        params = {}
                        params['model_name'] = model_name
                        params['industrial_model'] = industrial_model
                        item = ddbh.get_item(params)
                        if item == None:
                            items = []
                        else:
                            items = [ item ]
                            
                result = []
                for item in items:
                    if (event['httpMethod'] == 'DELETE'):
                        if(process_delete_item(item)):
                            key = {
                                'model_name': item['model_name'],
                                'industrial_model': item['industrial_model']
                            }
                            ddbh.delete_item(key = key)
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
    payload = {'model_name': item['model_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_describe_model',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body': payload})
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
    payload = {'model_name': item['model_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_delete_model',
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