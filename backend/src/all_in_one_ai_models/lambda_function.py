import json
import boto3
import helper
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime, timedelta

ssmh = helper.ssm_helper()
models_table = ssmh.get_parameter('/all_in_one_ai/config/meta/models_table')
icon_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/models/yolov5/icon')
print(models_table)
ddbh = helper.ddb_helper({'table_name': models_table})

s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        request = json.loads(event['body'])
        print(type(request['file_content']['data']))
        first = icon_s3uri.find('/', 5)
        bucket = icon_s3uri[ 5: first ]
        key = icon_s3uri[ first + 1 : ]
        key = '{0}{1}.jpg'.format(key, request['file_name'])
        response = s3_client.put_object( 
            Body = bytes(request['file_content']['data']),
            Bucket = bucket, 
            Key = key
        ) 

        s3uri = 's3://{0}/{1}'.format(bucket, key)
        
        params = {}
        params['model_name'] = request['model_name']
        params['algorithm_name'] = request['algorithm_name']
        params['model_description'] = request['model_description']
        params['model_labels'] = request['model_labels'].split('\n')
        params['model_samples'] = request['model_samples']
        params['model_icon'] = s3uri
        
        try:
            ddbh.put_item(params)
        except Exception as e:
            return {
                'statusCode': 400,
                'body': str(e)
            }
    
        print(request)
        return {
            'statusCode': 200,
            'body': s3uri
        }
    else:
        model_name = None
        if event['pathParameters'] != None and 'model_name' in event['pathParameters']:
            model_name = event['pathParameters']['model_name']

        algorithm_name = None
        if event['queryStringParameters'] != None and 'algorithm' in event['queryStringParameters']:
            algorithm_name = event['queryStringParameters']['algorithm']

        if model_name == None:
            if algorithm_name != None:
                items = ddbh.scan(FilterExpression=Attr('algorithm_name').eq(algorithm_name))
            else:
                items = ddbh.scan()

            return {
                'statusCode': 200,
                'body': json.dumps(items, default = defaultencode)
            }
        else:
            if algorithm_name == None:
                items = ddbh.scan(FilterExpression=Attr('model_name').eq(model_name))
            else:
                params = {}
                params['model_name'] = model_name
                params['algorithm_name'] = algorithm_name
    
                print(params)
                item = ddbh.get_item(params)

            return {
               'statusCode': 200,
                'body': json.dumps(item, default = defaultencode)
            }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
    
def get_presigned_url(bucket, key):
    try:
        url = s3_client.generate_presigned_url(
          ClientMethod='get_object',
          Params={'Bucket': bucket, 'Key': key}, 
          ExpiresIn=1000
        )
        print("Got presigned URL: {}".format(url))
    except ClientError:
        print("Couldn't get a presigned URL for client method {}.".format(client_method))
        raise
    return url

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")