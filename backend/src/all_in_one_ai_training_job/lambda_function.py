import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime, timedelta

model_name = 'yolov5'

ssmh = helper.ssm_helper()
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/sagemaker/image'.format(model_name))

ddbh = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        model_name = 'yolov5'
        case_name = request['case_name']

        weights_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/weights_s3uri'.format(model_name, case_name))
        cfg_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/{0}/cases/{1}/training_job/cfg_s3uri'.format(model_name, case_name))

        payload = {}
        payload['training_job_name'] = request['training_job_name']
        payload['training_image'] = request['training_image'] if('training_image' in request and request['training_image'] != '') else training_image
        payload['role_arn'] = role_arn
        payload['instance_type'] = request['instance_type']
        payload['instance_count'] = request['instance_count']
        payload['volume_size_in_gb'] = request['volume_size_in_gb']
        payload['images_s3uri'] = request['images_s3uri']
        payload['labels_s3uri'] = request['labels_s3uri']
        payload['weights_s3uri'] = request['weights_s3uri'] if('weights_s3uri' in request and request['weights_s3uri'] != '') else weights_s3uri
        payload['cfg_s3uri'] = request['cfg_s3uri'] if('cfg_s3uri' in request and request['cfg_s3uri'] != '') else cfg_s3uri
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
        training_job_name = None
        if event['pathParameters'] != None:
            if 'training_job_name' in event['pathParameters']:
                training_job_name = event['pathParameters']['training_job_name']

        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']
        try:
            if training_job_name == None:
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
                params['training_job_name'] = training_job_name
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
        raise Exception('Training job item is None')
    else:
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
            
            return payload
        else:
            raise Exception(response["FunctionError"])

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")