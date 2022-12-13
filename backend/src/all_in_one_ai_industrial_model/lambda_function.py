import json
import boto3
import helper
import uuid
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback
from botocore.client import Config

ssmh = helper.ssm_helper()
models_table = ssmh.get_parameter('/all_in_one_ai/config/meta/industrial_model_table')
ddbh = helper.ddb_helper({'table_name': models_table})

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
s3_resource = boto3.resource('s3')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
        
            model_id = None
            if event['pathParameters'] != None and 'model_id' in event['pathParameters']:
                model_id = event['pathParameters']['model_id']
            
            model_algorithm = request['model_algorithm']

            params = {}
            params['model_name'] = request['model_name']
            params['model_description'] = request['model_description']
            params['model_extra'] = request['model_extra']
            params['model_samples'] = request['model_samples']
        
            if(model_id == None):
                model_id = str(uuid.uuid4())

                icon_s3uri = '{0}{1}'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), model_id)
                icon_s3bucket, icon_s3key = get_bucket_and_key('{0}/icon/{1}.jpg'.format(icon_s3uri, model_id))
                response = s3_client.put_object( 
                    Body = bytes(request['file_content']['data']),
                    Bucket = icon_s3bucket, 
                    Key = icon_s3key
                )
                icon_s3uri = 's3://{0}/{1}'.format(icon_s3bucket, icon_s3key)
                params['model_icon'] = icon_s3uri
            
                params['model_id'] = model_id
                params['model_algorithm'] = request['model_algorithm']
                ddbh.put_item(params)
            
            else:
                if(request['file_name'] != ''):
                    icon_s3uri = '{0}{1}/icon'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), model_id)
                    icon_s3bucket, icon_s3key = get_bucket_and_key('{0}/icon/{1}.jpg'.format(icon_s3uri, model_id))
                    response = s3_client.put_object( 
                        Body = bytes(request['file_content']['data']),
                        Bucket = icon_s3bucket, 
                        Key = icon_s3key
                    )
                    icon_s3uri = 's3://{0}/{1}'.format(icon_s3bucket, icon_s3key)
                    params['model_icon'] = icon_s3uri
                else:
                    icon_s3uri = request['model_icon']
                
                keys = {
                    'model_id': model_id,
                    'model_algorithm': model_algorithm
                }
                
                ddbh.update_item(keys, params)

            if(model_algorithm == 'yolov5'):
                industrialmodels_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/industrialmodels')
                data_yaml_output_s3uri = '{0}{1}/data/cfg/data.yaml'.format(industrialmodels_s3uri, model_id)
                generate_data_yaml(data_yaml_output_s3uri, json.loads(params['model_extra'])['labels'])

            print(request)
            response = {
                'statusCode': 200,
                'body': json.dumps({
                    'id': model_id,
                    'icon': icon_s3uri
                })
            }
            
            print(response)
            return response
                
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
    else:
        model_id = None
        if event['pathParameters'] != None and 'model_id' in event['pathParameters']:
            model_id = event['pathParameters']['model_id']

        model_algorithm = None
        if event['queryStringParameters'] != None and 'model_algorithm' in event['queryStringParameters']:
            model_algorithm = event['queryStringParameters']['model_algorithm']

        if model_id == None:
            if model_algorithm != None:
                items = ddbh.scan(FilterExpression=Key('model_algorithm').eq(model_algorithm))
            else:
                items = ddbh.scan()

            return {
                'statusCode': 200,
                'body': json.dumps(items, default = defaultencode)
            }
        else:
            if model_algorithm == None:
                items = ddbh.scan(FilterExpression=Key('model_id').eq(model_id))

                return {
                   'statusCode': 200,
                    'body': json.dumps(items, default = defaultencode)
                }
            else:
                key = {}
                key['model_id'] = model_id
                key['model_algorithm'] = model_algorithm
                print(key)

            if event['httpMethod'] == 'DELETE':    
                response = ddbh.delete_item(key)

                return {
                    'statusCode': response['ResponseMetadata']['HTTPStatusCode'],
                    'body': json.dumps(key, default = defaultencode)
                }
            elif event['httpMethod'] == 'GET': 
                item = ddbh.get_item(key)

                return {
                    'statusCode': 200,
                    'body': json.dumps(item, default = defaultencode)
                }
            else:
                return {
                    'statusCode': 400,
                    'body': 'Unsupported HTTP method'
                }
                
def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key

def generate_data_yaml(data_yaml_output_s3uri, labels):
    data_yaml_output_bucket, data_yaml_output_key = get_bucket_and_key(data_yaml_output_s3uri)
    
    content = open('./yolov5/data.yaml').read()
    content =  content.replace('<<nc>>', str(len(labels)))
    names = ''
    for label in labels:
        names += "'" + label + "'" + ','
    names = names[0 : len(names) - 1]
    content = content.replace('<<names>>', names)

    response = s3_client.put_object(
        Body = content.encode('utf8'),
        Bucket = data_yaml_output_bucket,
        Key = data_yaml_output_key
    )

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")