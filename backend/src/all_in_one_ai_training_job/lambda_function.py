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
            model_algorithm = request['model_algorithm']

            payload = {}
            if(model_algorithm == 'yolov5'):
                payload['training_job_name'] = request['training_job_name']
                training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/sagemaker/image'.format(model_algorithm))
                if('training_image' in request and request['training_image'] != ''):
                    training_image = request['training_image']
                payload['algorithm_specification'] = {
                    'TrainingImage': training_image,
                    'TrainingInputMode': 'File',
                    'EnableSageMakerMetricsTimeSeries': True
                }
                instance_type = request['instance_type']
                instance_count = request['instance_count']
                volume_size_in_gb = request['volume_size_in_gb']
                payload['resource_config'] = {
                    'InstanceType': instance_type,
                    'InstanceCount': instance_count,
                    'VolumeSizeInGB': volume_size_in_gb
                }
                images_s3uri = request['images_s3uri']
                labels_s3uri = request['labels_s3uri']
                weights_s3uri = request['weights_s3uri'] if('weights_s3uri' in request and request['weights_s3uri'] != '') else '{0}{1}/data/weights'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), industrial_model)
                cfg_s3uri = request['cfg_s3uri'] if('cfg_s3uri' in request and request['cfg_s3uri'] != '') else '{0}{1}/data/cfg'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), industrial_model)
                payload['input_data_config'] = [
                    {
                        'ChannelName': 'cfg',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': cfg_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    },
                    {
                        'ChannelName': 'weights',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': weights_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    },
                    {
                        'ChannelName': 'images',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': images_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    },
                    {
                        'ChannelName': 'labels',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': labels_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    }
                ]
                output_s3uri = request['output_s3uri']
                payload['output_data_config'] = {
                    'S3OutputPath': output_s3uri
                }
                payload['tags'] = request['tags'] if('tags' in event) else []
            elif(model_algorithm == 'gluoncv'):
                payload['training_job_name'] = request['training_job_name']
                payload['role_arn'] = role_arn
                instance_type= request['instance_type']
                instance_count = request['instance_count']
                payload['resource_config'] = {
                    'InstanceType': instance_type,
                    'InstanceCount': instance_count
                }
                training_s3uri = request['training_s3uri']
                test_s3uri = request['test_s3uri']
                validation_s3uri = request['validation_s3uri']
                payload['input_data_config']= [
                    {
                        'ChannelName': 'training',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': training_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    },
                    {
                        'ChannelName': 'validation',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': validation_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    },
                    {
                        'ChannelName': 'test',
                        'DataSource': {
                            'S3DataSource': {
                                'S3DataType': 'S3Prefix',
                                'S3Uri': test_s3uri,
                                'S3DataDistributionType': 'FullyReplicated'
                            }
                        }
                    }
                ]
                region_name = boto3.session.Session().region_name
                payload['hyperparameters'] = request['hyperparameters'] if 'hyperparameters' in request else {}
                if('batch-size' not in payload['hyperparameters']):
                    payload['hyperparameters']['batch-size'] = 64
                if('classes' not in payload['hyperparameters']):
                    payload['hyperparameters']['classes'] = 10
                if('epochs' not in payload['hyperparameters']):
                    payload['hyperparameters']['epochs'] = 2
                if('learning-rate' not in payload['hyperparameters']):
                    payload['hyperparameters']['learning-rate'] = 0.001
                if('model-name' not in payload['hyperparameters']):                
                    payload['hyperparameters']['model-name'] = 'ResNet50_v2'
                if('momentum' not in payload['hyperparameters']):
                    payload['hyperparameters']['momentum'] = 0.9
                if('num-gpus' not in payload['hyperparameters']):
                    payload['hyperparameters']['num-gpus'] = 1
                if('num-workers' not in payload['hyperparameters']):
                    payload['hyperparameters']['num-workers'] = 8
                if('sagemaker_container_log_level' not in payload['hyperparameters']):
                    payload['hyperparameters']['sagemaker_container_log_level'] = 20
                if('agemaker_job_name' not in payload['hyperparameters']):
                    payload['hyperparameters']['sagemaker_job_name'] = training_job_name
                if('sagemaker_program' not in payload['hyperparameters']):
                    payload['hyperparameters']['sagemaker_program'] = 'transfer_learning.py'
                if('sagemaker_region' not in payload['hyperparameters']):
                    payload['hyperparameters']['sagemaker_region'] = region_name
                if('sagemaker_submit_directory' not in payload['hyperparameters']):
                    payload['hyperparameters']['sagemaker_submit_directory'] = '{0}{1}/script/script.tar.gz'.format(ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/industrialmodels'.format(model_algorithm)), industrial_model)
                training_image = image_uris.retrieve(
                    framework = 'mxnet',
                    region = region_name,
                    version = '1.8.0', 
                    py_version = 'py37', 
                    image_scope = 'training', 
                    instance_type = instance_type
                )
                payload['training_image'] = request['training_image'] if('training_image' in request and request['training_image'] != '') else training_image
                output_s3uri = request['output_s3uri']
                payload['output_data_config'] = {
                    'S3OutputPath': output_s3uri
                }
                payload['tags'] = request['tags'] if('tags' in event) else []
            else:
                return {
                    'statusCode': 400,
                    'body': 'Unsupported model algorithm'
                }

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