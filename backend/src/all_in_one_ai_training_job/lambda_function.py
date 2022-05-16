import json
import boto3
import helper
from sagemaker import image_uris
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])

            industrial_model = request['industrial_model']

            payload = {}
            payload['training_job_name'] = request['training_job_name']
            payload['role_arn'] = role_arn
            payload['algorithm_specification'] = {
                'TrainingImage': request['training_image'],
                'TrainingInputMode': 'File',
                'EnableSageMakerMetricsTimeSeries': True
            }
            payload['resource_config'] = {
                'InstanceType': request['instance_type'],
                'InstanceCount': request['instance_count'],
                'VolumeSizeInGB': request['volume_size_in_gb']
            }
            payload['input_data_config'] = []
            for key in request['inputs'].keys():
                payload['input_data_config'].append(
                    {
                        'ChannelName': key,
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': request['inputs'][key],
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    }
                )
            payload['CheckpointConfig'] = {
                'S3Uri': request['checkpoint_s3uri'],
                'LocalPath': request['checkpoint_localpath']
            }
            payload['EnableManagedSpotTraining'] = request['enable_managed_spot_training']
            payload['StoppingCondition'] = {
                'MaxRuntimeInSeconds': int(payload['max_runtime_in_seconds']),
                'MaxWaitTimeInSeconds': payload['max_waittime_in_seconds']
            }

            payload['tags'] = request['tags'] if('tags' in event) else []

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_training_job',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : payload})
            )

            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                if(payload['statusCode'] == 200):
                    params = {}
                    params['training_job_name'] = request['training_job_name']
                    params['industrial_model'] = industrial_model
                    ddbh.put_item(params)
                return {
                    'statusCode': payload['statusCode'],
                    'body': json.dumps(payload['body'])
                }
            else:
                return {
                    'statusCode': 400,
                    'body': response["FunctionError"]
                }
        
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }

    else:
        training_job_name = None
        if event['pathParameters'] != None and 'training_job_name' in event['pathParameters']:
                training_job_name = event['pathParameters']['training_job_name']

        industrial_model = None
        if event['queryStringParameters'] != None and 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']

        action = None
        if event['queryStringParameters'] != None and 'action' in event['queryStringParameters']:
                action = event['queryStringParameters']['action']

        try:
            print(training_job_name)
            print(industrial_model)
            print(action)

            if(action == 'attach' and event['httpMethod'] == 'GET'):
                params = {}
                params['training_job_name'] = training_job_name
                params['industrial_model'] = industrial_model
                ddbh.put_item(params)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(params)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                key = {
                    'training_job_name': training_job_name,
                    'industrial_model': industrial_model
                }
                ddbh.delete_item(key)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(key)
                }
            elif (action == 'list' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_training_jobs',
                    InvocationType = 'RequestResponse',
                    Payload=''
                )
            
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    
                    return {
                        'statusCode': payload['statusCode'],
                        'body': payload['body']
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
            else:
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

                result = []
                for item in items:
                    if(process_item(item, action)):
                        result.append(item)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(result, default = defaultencode)
                }

        except Exception as e:
            traceback.print_exc()
            return {
                   'statusCode': 400,
                    'body': str(e)
            }
            
def process_item(item, action):
    payload = {'training_job_name': item['training_job_name']}
    if(action == 'stop'):
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_stop_training_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )
    else:
        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_describe_training_job',
            InvocationType = 'RequestResponse',
            Payload=json.dumps({'body' : payload})
        )
    
    if('FunctionError' not in response):
        payload = response["Payload"].read().decode("utf-8")
        payload = json.loads(payload)
        if(payload['statusCode'] == 200):
            payload = json.loads(payload['body'])
            item.clear()
            item.update(payload)
            return True
        else:
            print(payload['body'])
            return False
    else:
        print(response['FunctionError'])
        return False

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")