import json
import boto3
import helper
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from datetime import date, datetime, timedelta

inference_images = {
  "yolov5": "034068151705.dkr.ecr.ap-southeast-1.amazonaws.com/all-in-one-yolov5:latest"
}

ssmh = helper.ssm_helper()
model_table = ssmh.get_parameter('/all_in_one_ai/config/meta/model_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': model_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])

        model_name = 'yolov5'
        case_name = request['case_name']

        payload = {}
        payload['model_name'] = request['model_name']
        payload['role_arn'] = role_arn
        payload['container_image'] = request['container_image'] if('container_image' in request and request['container_image'] != '') else inference_images[model_name]
        payload['model_data_url'] = request['model_data_url']
        payload['mode'] = request['mode']
        if('tags' in request):
            payload['tags'] = request['tags']

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_create_model',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body': payload})
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
        model_name = None
        if event['pathParameters'] != None:
            model_name = event['pathParameters']['model_name']
    
        case_name = None
        if event['queryStringParameters'] != None:
            if 'case' in event['queryStringParameters']:
                case_name = event['queryStringParameters']['case']
    
        if model_name == None:
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
            params['model_name'] = model_name
            params['case_name'] = case_name
            
            item = ddbh.get_item(params)
    
            process_item(item)
    
            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }
        
def process_item(item):
    if 'creation_time' not in item:
        payload = {'model_name': item['model_name']}
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_model',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body': payload})
        )

        if('FunctionError' not in response):
            payload = response["Payload"].read().decode("utf-8")
            payload = json.loads(payload)
            payload = json.loads(payload)

            creation_time = datetime.fromisoformat(payload['CreationTime']) + timedelta(hours=8)
            
            item['creation_time'] = creation_time.strftime("%Y-%m-%d %H:%M:%S")
            
            params = {}
            params['creation_time'] = item['creation_time']

            key = {
                'model_name': item['model_name'],
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
