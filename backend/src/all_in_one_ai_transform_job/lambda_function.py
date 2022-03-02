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

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = event['body']
    
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
            ddbh.put_item(key, params)
            
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

        if transform_job_name == None:
            if case_name != None:
                items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name))
            else:
                items = ddbh.scan()
            for item in items:
                process_item(item)

            return {
                'statusCode': 200,
                'body': json.dumps(items, default = defaultencode)
            }
        else:
            params = {}
            params['transform_job_name'] = transform_job_name
            if case_name != None:
                params['case_name'] = case_name
            item = ddbh.get_item(params)
            process_item(item)
        
            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }

def process_item(item):
    if 'transform_job_status' not in item or item['transform_job_status'] in ['InProgress', 'Stopping']:
        payload = {'transform_job_name': item['transform_job_name']}
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_trasnform_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)
        
            creation_time = datetime.fromisoformat(payload['CreationTime']) + timedelta(hours=8)
            training_start_time = datetime.fromisoformat(payload['TransformStartTime']) + timedelta(hours=8)
    
            item['transform_job_status'] = payload['TransformJobStatus']
            item['creation_time'] = creation_time.strftime("%Y-%m-%d %H:%M:%S")
            item['transform_start_time'] = transform_start_time.strftime("%Y-%m-%d %H:%M:%S")
    
            params = {}
            params['transform_job_status'] = item['transform_job_status']
            params['creation_time'] = item['creation_time']
            params['duration'] = '-'
            params['transform_end_time'] = '-'
    
            if('TransformEndTime' in response.keys()):
                transform_end_time = datetime.fromisoformat(payload['TransformEndTime']) + timedelta(hours=8)
    
                duration_in_seconds = int((transform_end_time - transform_start_time).total_seconds())
            
                days    = divmod(duration_in_seconds, 86400)
                hours   = divmod(days[1], 3600)
                minutes = divmod(hours[1], 60)
                seconds = divmod(minutes[1], 1)
                if days[0] != 0:
                    duration = '{0} days {1} hours {2} minutes {3} seconds'.format(int(days[0]), int(hours[0]), int(minutes[0]), int(seconds[0]))
                elif hours[0] != 0:
                    duration = '{0} hours {1} minutes {2} seconds'.format(int(hours[0]), int(minutes[0]), int(seconds[0]))
                elif minutes[0] != 0:
                    duration = '{0} minutes {1} seconds'.format(int(minutes[0]), int(seconds[0]))
                else:
                    duration = '{1} seconds'.format(int(seconds[0]))
    
    
                item['transform_end_time'] = transform_end_time.strftime("%Y-%m-%d %H:%M:%S")
                item['duration'] = duration
    
                params['duration'] = item['duration']
                params['transform_end_time'] = item['transform_end_time']
    
            key = {
                'transform_job_name': item['transform_job_name'],
                'case_name': item['case_name']
            }
                
            ddbh.update_item(key, params)
    
    return item

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")

