import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime, timedelta
import traceback

ssmh = helper.ssm_helper()
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        industrial_model = request['industrial_model']
        model_algorithm = request['model_algorithm']

        training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/sagemaker/image'.format(model_algorithm))
        weights_s3uri = '{0}{1}/data/weights'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), industrial_model)
        cfg_s3uri = '{0}{1}/data/cfg'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), industrial_model)

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
            FunctionName = 'all_in_one_ai_create_training_job_{0}'.format(model_algorithm),
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )

        if('FunctionError' not in response):
            params = {}
            params['industrial_model'] = industrial_model
            params['training_job_name'] = request['training_job_name']
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
        if event['pathParameters'] != None and 'training_job_name' in event['pathParameters']:
                training_job_name = event['pathParameters']['training_job_name']

        industrial_model = None
        if event['queryStringParameters'] != None and 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']
        try:
            if training_job_name == None:
                if industrial_model != None:
                    items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                else:
                    items = ddbh.scan()
            else:
                if industrial_model == None:
                    items = ddbh.scan(FilterExpression=Key('training_job_name').eq(training_job_name))
                else:
                    params = {}
                    params['training_job_name'] = training_job_name
                    params['industrial_model'] = industrial_model
                    item = ddbh.get_item(params)
                    if item == None:
                        items = []
                    else:
                        items = [ item ]
                    
            for item in items:
                process_item(item)
                if item == {}:
                    items.remove(item)            
            
            return {
                'statusCode': 200,
                'body': json.dumps(items, default = defaultencode)
            }

        except Exception as e:
            traceback.print_exc()
            return {
                   'statusCode': 400,
                    'body': str(e)
            }
            
def process_item(item):
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
            
        item.clear()
        item.update(payload)
    else:
        print(response['FunctionError'])
        item.clear()

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")