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

ssmh = helper.ssm_helper()
endpoint_table = ssmh.get_parameter('/all_in_one_ai/config/meta/endpoint_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': endpoint_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        case_name = request['case_name']

        payload = {}
        payload['endpoint_name'] = request['endpoint_name']
        payload['endpoint_config_name'] = '{0}-{1}'.format(payload['endpoint_name'], ''.join(random.sample(string.ascii_lowercase + string.digits, 6)))
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
            params = payload
            params['case_name'] = case_name
            ddbh.put_item(payload)
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
        endpoint_name = None
        if event['pathParameters'] != None:
            if('endpoint_name' in event['pathParameters']):
                endpoint_name = event['pathParameters']['endpoint_name']
    
        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']
        try:
            if endpoint_name == None:
                if case_name != None:
                    items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name))
                else:
                    items = ddbh.scan()
                
                list = []
                for item in items:
                    item = process_item(item)
                    list.append(item)
    
                return {
                    'statusCode': 200,
                    'body': json.dumps(list, default = defaultencode)
                }
            else:
                params = {}
                params['endpoint_name'] = endpoint_name
                params['case_name'] = case_name
                
                item = ddbh.get_item(params)
        
                item = process_item(item)
        
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
            
def process_item(item):
    if(item == None):
        raise Exception('Endpoint item is None')
    else:
        payload = {'endpoint_name': item['endpoint_name']}
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_endpoint',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)

            return payload
        else:
            raise Exception(response["FunctionError"])

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")