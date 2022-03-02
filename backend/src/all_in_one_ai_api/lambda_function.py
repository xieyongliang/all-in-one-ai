import json
import boto3
import helper
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime, timedelta

ssmh = helper.ssm_helper()
api_table = ssmh.get_parameter('/all_in_one_ai/config/meta/api_table')

ddbh = helper.ddb_helper({'table_name': api_table})

lambda_client = boto3.client('lambda')
api_client = boto3.client('apigateway')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])
        print(request)

        api_name = request['api_name']
        case_name = request['case_name']
        
        if('rest_api_id' not in request):
            if('rest_api_name' in request):
                rest_api_name = request['rest_api_name']
                response = create_rest_api(
                    name = rest_api_name
                )
                rest_api_id = response['id']
            else:
                return {
                    'statusCode': 400,
                    'body': 'Parameter - rest_api_name and rest_api_id are missing'
                }
        else:
            rest_api_id = request['rest_api_id']
        
        payload = {}
        payload['rest_api_id'] = rest_api_id
        payload['api_path'] = request['api_path']
        payload['api_stage'] = request['api_stage']
        payload['api_method'] = request['api_method']
        payload['api_function'] = request['api_function']

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_create_api',
            InvocationType = 'RequestResponse',
            Payload=json.dumps(payload)
        )
        
        if('FunctionError' not in response):
            params = payload
            
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)
            
            params['api_name'] = api_name
            params['case_name'] = case_name
            params['rest_api_name'] = payload['rest_api_name']
            params['api_url'] = payload['api_url']
            params['created_date'] = payload['created_date']
            
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
        if event['queryStringParameters'] != None:
            if 'query' in event['queryStringParameters']:
                item = event['queryStringParameters']['query']
                if(item == 'restapis'):
                    response = api_client.get_rest_apis()
                    payload = response['items']

                    return {
                        'statusCode': 200,
                        'body': json.dumps(payload, default = defaultencode)
                    }
        
        api_name = None
        if event['pathParameters'] != None:
            api_name = event['pathParameters']['api_name']

        case_name = None
        if 'case' in event['queryStringParameters']:
            case_name = event['queryStringParameters']['case']
                
        if api_name == None:
            if case_name != None:
                items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name))
            else:
                items = ddbh.scan()

            return {
                'statusCode': 200,
                'body': json.dumps(items, default = defaultencode)
            }
        else:
            params = {}
            params['api_name'] = api_name
            params['case_name'] = case_name
            
            item = ddbh.get_item(params)
    
            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }


def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
