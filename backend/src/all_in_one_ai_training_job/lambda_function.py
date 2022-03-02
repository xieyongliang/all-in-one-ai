import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime, timedelta

training_images = {
  "yolov5": "034068151705.dkr.ecr.ap-east-1.amazonaws.com/spot-bot-yolov5:latest"
}

ssmh = helper.ssm_helper()
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        model_name = 'yolov5'
        case_name = request['case_name']

        weights_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/{1}/training_job/weights_s3uri'.format(model_name, case_name))
        cfg_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/{1}/training_job/cfg_s3uri'.format(model_name, case_name))

        payload = {}
        payload['training_job_name'] = request['training_job_name']
        payload['training_image'] = request['training_image'] if('training_image' in request and request['training_image'] != '') else training_images['yolov5']
        payload['role_arn'] = role_arn
        payload['instance_type'] = request['instance_type']
        payload['instance_count'] = request['instance_count']
        payload['volume_size_in_gb'] = request['volume_size_in_gb']
        payload['images_s3uri'] = request['images_s3uri']
        payload['labels_s3uri'] = request['labels_s3uri']
        payload['weights_s3uri'] = request['weights_s3uri'] if('weights_s3uri' in request and ['weights_s3uri'] != '') else weights_s3uri
        payload['cfg_s3uri'] = request['cfg_s3uri'] if('cfg_s3uri' in request and ['cfg_s3uri'] != '') else cfg_s3uri
        payload['output_s3uri'] = request['output_s3uri']
        payload['tags'] = request['tags'] if('tags' in event) else []

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_create_training_job_{0}'.format(model_name),
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
                'body': response["FunctionError"]
            }
    else:
        training_job_name = None
        if event['pathParameters'] != None:
            if 'training_job_name' in event['pathParameters']:
                training_job_name = event['pathParameters']['training_job_name']

        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']
        
        if training_job_name == None:
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
            params['training_job_name'] = training_job_name
            if case_name != None:
                params['case_name'] = case_name
            item = ddbh.get_item(params)
            process_item(item)
        
            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }

def process_item(item):
    if 'training_job_status' not in item or item['training_job_status'] in ['InProgress', 'Stopping']:
        payload = {'training_job_name': item['training_job_name']}
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_training_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)

            creation_time = datetime.fromisoformat(payload['CreationTime']) + timedelta(hours=8)
            training_start_time = datetime.fromisoformat(payload['TrainingStartTime']) + timedelta(hours=8)
    
            item['training_job_status'] = payload['TrainingJobStatus']
            item['creation_time'] = creation_time.strftime("%Y-%m-%d %H:%M:%S")
            item['training_start_time'] = training_start_time.strftime("%Y-%m-%d %H:%M:%S")
            item['model_artifacts'] = payload['ModelArtifacts']
    
            params = {}
            params['training_job_status'] = item['training_job_status']
            params['creation_time'] = item['creation_time']
            params['training_start_time'] = item['training_start_time']
            params['model_artifacts'] = item['model_artifacts']
            params['duration'] = '-'
            params['training_end_time'] = '-'
        
            if('TrainingEndTime' in payload):
                training_end_time = datetime.fromisoformat(payload['TrainingEndTime']) + timedelta(hours=8)
                duration_in_seconds = int((training_end_time - training_start_time).total_seconds())
    
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

                item['training_end_time'] = training_end_time.strftime("%Y-%m-%d %H:%M:%S")
                item['duration'] = duration
                
                params['training_end_time'] = item['training_end_time']
                params['duration'] = item['duration']
            
            key = {
                'training_job_name': item['training_job_name'],
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
