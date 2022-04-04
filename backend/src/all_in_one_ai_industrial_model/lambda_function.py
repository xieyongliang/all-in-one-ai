import json
import boto3
import helper
import uuid
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
models_table = ssmh.get_parameter('/all_in_one_ai/config/meta/industrial_model_table')
ddbh = helper.ddb_helper({'table_name': models_table})
industrialmodels_s3uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/yolov5/industrialmodels')

s3_client = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))
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
            params['model_description'] = request['model_description']
            params['model_labels'] = request['model_labels'].split('\n')
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

                if(model_algorithm == 'yolov5'):
                    industrialmodels_s3bucket, industrialmodels_s3key = get_bucket_and_key(industrialmodels_s3uri)
                    s3bucketcopy(industrialmodels_s3bucket, '{0}default/data/cfg'.format(industrialmodels_s3key), '{0}{1}/data/cfg'.format(industrialmodels_s3key, model_id))
                    s3bucketcopy(industrialmodels_s3bucket, '{0}default/data/weights'.format(industrialmodels_s3key), '{0}{1}/data/weights'.format(industrialmodels_s3key, model_id))
                    data_yaml_template_s3uri = '{0}default/data/cfg/data.yaml'.format(industrialmodels_s3uri)
                    data_yaml_output_s3uri = '{0}{1}/data/cfg/data.yaml'.format(industrialmodels_s3uri, model_id)
                    generate_data_yaml(data_yaml_template_s3uri, data_yaml_output_s3uri, params['model_labels'])
            
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
                params = {}
                params['model_id'] = model_id
                params['model_algorithm'] = model_algorithm
    
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
    except ClientError as e:
        print(str(e))
        raise
    return url

def generate_data_yaml(data_yaml_template_s3uri, data_yaml_output_s3uri, labels):
    data_yaml_template_bucket, data_yaml_tempalte_key = get_bucket_and_key(data_yaml_template_s3uri)
    data_yaml_output_bucket, data_yaml_output_key = get_bucket_and_key(data_yaml_output_s3uri)
    
    s3_object = s3_client.get_object(
        Bucket = data_yaml_template_bucket, 
        Key = data_yaml_tempalte_key
    )
    
    bytes = s3_object["Body"].read()
    content = bytes.decode('utf8')
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

def s3bucketcopy(s3_bucket, old_key, new_key):
    print(s3_bucket)
    print(old_key)
    print(new_key)
    try:
        paginator = s3_client.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket = s3_bucket, Prefix = old_key)
        for page in pages:
            keycount = page['KeyCount']
            if(keycount > 0):
                for key in page['Contents']:
                    file = key['Key']
                    try:
                        output = file.split(old_key)
                        newfile = new_key + output[1]
                        input_source = {'Bucket': s3_bucket,'Key' : file }
                        s3_resource.Object(s3_bucket, newfile).copy_from(CopySource = input_source)
                    except ClientError as e:
                        print(e.page['Error']['Message'])
                    else:
                        print('Success')

            else:
                print('No matching records')
    except ClientError as e:
        print(str(e))
    else:
        print('Operatio completed')

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")