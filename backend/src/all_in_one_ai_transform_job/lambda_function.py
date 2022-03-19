import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime, timedelta

ssmh = helper.ssm_helper()
transform_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/transform_job_table')
ddbh = helper.ddb_helper({'table_name': transform_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])
        
        case_name = request['case_name']
    
        payload = {}
        payload['transform_job_name'] = request['transform_job_name']
        payload['model_name'] = request['model_name']
        payload['s3_data_type'] = request['s3_data_type']
        payload['content_type'] = request['content_type']
        payload['instance_type'] = request['instance_type']
        payload['instance_count'] = request['instance_count']
        payload['max_concurrent_transforms'] = request['max_concurrent_transforms']
        payload['input_s3uri'] = request['input_s3uri']
        payload['output_s3uri'] = request['output_s3uri']
        payload['tags'] = request['tags'] if('tags' in event) else []
        
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_create_transform_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

        if('FunctionError' not in response):
            params = payload
            params['case_name'] = case_name
            ddbh.put_item(params)
            
            return {
                'statusCode': response['StatusCode'],
                'body': response["Payload"].read().decode("utf-8")
            }
        else:
            return {
                'statusCode': 400,
                'body': response["FunctionError"]
            }
    else:
        transform_job_name = None
        if event['pathParameters'] != None:
            if 'transform_job_name' in event['pathParameters']:
                transform_job_name = event['pathParameters']['transform_job_name']

        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']

        try:
            if transform_job_name == None:
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
                params['transform_job_name'] = transform_job_name
                if case_name != None:
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
        raise Exception('Transform job item is None')
    else:
        payload = {'transform_job_name': item['transform_job_name']}
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_transform_job',
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

    return item

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
