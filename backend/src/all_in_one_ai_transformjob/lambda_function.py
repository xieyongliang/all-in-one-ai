import json
import boto3
from botocore.config import Config
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime, timedelta
import helper

ssmh = helper.ssm_helper()
transformjob_table = ssmh.get_parameter('/all_in_one_ai/config/meta/transformjob_table')
ddbh = helper.ddb_helper({'table_name': transformjob_table})

config = Config(
    read_timeout=120,
    retries={
        'max_attempts': 0
    }
)

sagemaker_runtime_client = boto3.client('sagemaker-runtime', config=config)
def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = event['body']
    
        transformjob_name = request['transformjob_name']
        model_name = request['model_name']
        data_type = request['data_type']
        content_type = request['content_type']
        instance_type = request['instance_type']
        instance_count = request['instance_count']
        max_concurrent_transforms = request['max_concurrent_transforms']
        s3_input_uri = request['s3_input_uri']
        s3_output_uri = request['s3_output_uri']

        response = sagemaker_runtime_client.create_transform_job(
            TransformJobName = transformjob_name,
            ModelName = model_name,
            MaxConcurrentTransforms = max_concurrent_transform,
            TransformInput={
                'DataSource': {
                    'S3DataSource': {
                        'S3DataType': data_type,
                        'S3Uri': s3_input_uri
                    }
                },
                'ContentType': content_type,
            },
            TransformOutput={
                'S3OutputPath': s3_output_uri
            },
            TransformResources={
                'InstanceType': instance_type,
                'InstanceCount': instance_count
            }
        )
        
        statusCode = response['HTTPStatusCode']
        
        if statusCode == 200:
            params = {}
            params['transformjob_name'] = transformjob_name
            params['model_name'] = model_name
            params['data_type'] = data_type
            params['content_type'] = content_type
            params['instance_type'] = instance_type
            params['instance_count'] = instance_count
            params['max_concurrent_transforms'] = max_concurrent_transforms
            params['s3_input_uri'] = s3_input_uri
            params['s3_output_uri'] = s3_output_uri
            
            ddbh.put_item(key, params)

        return {
            'statusCode': 200,
            'body': response['HTTPStatusCode']
        }

    else:
        transformjob_name = None
        if event['pathParameters'] != None:
            transformjob_namev = event['pathParameters']['transformjob_name']

        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']

        if transformjob_name == None:
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
            params['transformjob_name'] = transformjob_name
            if case_name != None:
                params['case_name'] = case_name
            item = ddbh.get_item(params)
            process_item(item)
        
            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }

    
def process_item(item):
    if 'status' not in item or item['status'] == 'InProgress':
        response = sagemaker_runtime_client.describe_transform_job(
            TransformJobName = item['transformjob_name']
        )
        print(response)

        duration_in_seconds = int((response['TransformEndTime'] - response['TransformStartTime']).total_seconds())
        
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

        creation_time = response['CreationTime'] - timedelta(hours=8)
        transform_start_time = response['TransformStartTime'] - timedelta(hours=8)
        transform_end_time = response['TransformEndTime'] - timedelta(hours=8)
        
        item['status'] = response['TransformJobStatus']
        item['creation_time'] = creation_time.strftime("%Y-%m-%d %H:%M:%S")
        item['transform_start_time'] = transform_start_time.strftime("%Y-%m-%d %H:%M:%S")
        item['transform_end_time'] = transform_end_time.strftime("%Y-%m-%d %H:%M:%S")
        
        item['duration'] = duration

        params = {}
        params['status'] = item['status']
        params['creation_time'] = item['creation_time']
        params['duration'] = item['duration']
        params['transform_start_time'] = item['transform_start_time']
        params['transform_end_time'] = item['transform_end_time']

        key = {
            'transformjob_name': item['transformjob_name'],
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
