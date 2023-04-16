import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback
import sagemaker
import helper
import os
from botocore.client import Config
from boto3.dynamodb.conditions import Key, Attr
from botocore.errorfactory import ClientError

ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

lambda_client = boto3.client('lambda')
sagemaker_session = sagemaker.Session()
bucket = sagemaker_session.default_bucket()

web_portal_url = ssmh.get_parameter('/all_in_one_ai/config/meta/web_portal_url')
dynamodb = boto3.resource('dynamodb')
ddb_table = dynamodb.Table('all_in_one_ai_training_job')

s3_client = boto3.client('s3', config=Config(signature_version='s3v4'))
s3_resource= boto3.resource('s3')

def get_all_in_one_ai_url():
    return web_portal_url

def get_all_in_one_ai_url_model_id(job_name):
    resp = ddb_table.query(
        KeyConditionExpression=Key('training_job_name').eq(job_name)
    )
    return resp['Items'][0]['industrial_model']
    

def lambda_handler(event, context):
    print(event)
    
    request = json.loads(event['body'])
    
    try:
        algorithm = request['model_algorithm']
        industrial_model = request['industrial_model']
        instance_type = request['instance_type']
        instance_count = int(request['instance_count'])
        hyperparameters = request['model_hyperparameters'] if('model_hyperparameters' in request) else {}
        inputs = request['inputs']
        job_name = request['training_job_name']
                
        if(algorithm == 'yolov5'):
            default_hyperparameters = {
                'data': '/opt/ml/input/data/cfg/data.yaml', 
                'cfg': 'yolov5s.yaml', 
                'weight': 'yolov5s.pt', 
                'project': '/opt/ml/model/',
                'name': 'tutorial', 
                'img': 640, 
                'batch': 16, 
                'epochs': 100,
                'device': 0
            }
            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            git_config = {'repo': 'https://github.com/ultralytics/yolov5.git', 'branch': 'v6.2'}
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'train.py',
                    'source_dir': '.',
                    'git_config': git_config,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'py_version': 'py38',
                    'framework_version': '1.12'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_pytorch',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'gluoncv'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                'classes': 1000, 
                'batch_size': 8,
                'epochs': 20, 
                'learning_rate': 0.001,
                'momentum': 0.9,
                'wd': 0.0001,
                'num_workers': 8,
                'model_name': 'ResNet50_v2'
            }
            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'finetune.py',
                    'source_dir': source_dir,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'py_version': 'py37',
                    'framework_version': '1.8.0'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_mxnet',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'gluonts'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm)) 

            default_hyperparameters = {
                'algo-name': 'DeepAR', 
                'freq': '1M', 
                'prediction-length': 2*12, 
                'context-length': 20*12, 
                'epochs': 200, 
                'batch-size': 2048  , 
                'num-batches-per-epoch': 2
            }
            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'train.py',
                    'source_dir': source_dir,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'py_version': 'py38',
                    'framework_version': '1.9.0'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_mxnet',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'cpt'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                'model_name_or_path': 'fnlp/cpt-large',
                'num_train_epochs': 10,
                'per_device_train_batch_size': 4,   
                'text_column': 'text',
                'summary_column': 'summary',
                'output_dir': '/opt/ml/model',
                'train_file': '/opt/ml/input/data/dataset/train.json',
                'validation_file':'/opt/ml/input/data/dataset/val.json',
                'test_file': '/opt/ml/input/data/dataset/test.json',
                'val_max_target_length': 80,
                'path': 'json'
            }
            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'train.py',
                    'source_dir': source_dir,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'transformers_version' : '4.12.3',
                    'pytorch_version': '1.9.1',
                    'tensorflow_version': None,
                    'py_version': 'py38',
                    'inputs': inputs
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_huggingface',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'gabsa'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                'task' : 'tasd', 
                'dataset' : 'dataset', 
                'model_name_or_path' : 't5-base', 
                'paradigm': 'extraction',
                'eval_batch_size' :'16',
                'train_batch_size' :'2',
                'learning_rate' :'3e-4',
                'num_train_epochs':'4'
            }

            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'train.py',
                    'source_dir': source_dir,
                    'git_config': None,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'framework_version': '1.7.1',
                    'py_version': 'py36',

                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_pytorch',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'paddlenlp'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                'train_path': '/opt/ml/input/data/dataset/train.txt',
                'dev_path': '/opt/ml/input/data/dataset/dev.txt', 
                'save_dir': '/opt/ml/model',                 
                'batch_size' : 16, 
                'learning_rate' : 1e-5, 
                'max_seq_len' : 512,
                'num_epochs' : 100,
                'seed' : 1000,
                'logging_steps': 10,
                'valid_steps': 100,
                'device': 'gpu',
                'model': 'uie-base'
            }

            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'finetune.py',
                    'source_dir': source_dir,
                    'git_config': None,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'framework_version': '1.9.0',
                    'py_version': 'py38',

                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_pytorch',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'paddleocr'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))
            
            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'entry_point': 'train.py',
                    'source_dir': source_dir,
                    'git_config': None,
                    'role': role_arn,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'framework_version': '2.2.2',
                    'py_version': 'py37',

                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_tensorflow',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )        
        elif(algorithm == 'stylegan'):
            image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/training_image'.format(algorithm))

            default_hyperparameters = {
                'outdir': '/opt/ml/model',
                'gpus': 1,
                'kimg': 1000
            }

            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]

            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'image_uri': image_uri,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_generic',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'stable-diffusion-webui'):
            image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/training_image'.format(algorithm))
            embedding_s3uri = 's3://{0}/stable-diffusion-webui/embeddings/'.format(bucket)
            models_s3uri = 's3://{0}/stable-diffusion-webui/models/Stable-diffusion/'.format(bucket)
            hypernetwork_s3uri = 's3://{0}/stable-diffusion-webui/hypernetwork/'.format(bucket)
            lora_s3uri = 's3://{0}/stable-diffusion-webui/lora/'.format(bucket)
            dreambooth_s3uri = 's3://{0}/stable-diffusion-webui/dreambooth/'.format(bucket)
            default_hyperparameters = {
                'embeddings-s3uri': embedding_s3uri,
                'hypernetwork-s3uri': hypernetwork_s3uri,
                'train-task': 'embedding',
                'api-endpoint': ssmh.get_parameter('/all_in_one_ai/config/meta/api_endpoint')
            }

            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]

            print(hyperparameters)
            username = hyperparameters['username']
            if hyperparameters['train-task'] == 'embedding' or hyperparameters['train-task'] == 'hypernetwork':
                if 'embeddings' not in inputs:
                    with_embeddings = s3uri_contain_files(embedding_s3uri)
                    if with_embeddings:
                        inputs['embeddings'] = embedding_s3uri
                if 'hypernetwork' not in inputs:
                    with_hypernetwork = s3uri_contain_files(hypernetwork_s3uri)
                    if with_hypernetwork:
                        inputs['hypernetwork'] = hypernetwork_s3uri

                if 'models' not in inputs or inputs['models'] == '':
                    model_name = os.path.basename(hyperparameters['ckpt'])
                    found_in_models_subdir = False
                    model_bucket, model_key = get_bucket_and_key('{0}{1}/{2}'.format(models_s3uri, username, model_name))
                    try:
                        s3_client.head_object(Bucket=model_bucket, Key=model_key)
                        inputs['models'] = '{0}{1}/{2}'.format(models_s3uri, username, model_name[0 : -5])
                        found_in_models_subdir = True
                    except ClientError as e:
                        if e.response['Error']['Code'] == "404":
                            pass
                        else:
                            raise e
                    if not found_in_models_subdir:
                        model_bucket, model_key = get_bucket_and_key('{0}{1}'.format(models_s3uri, model_name))
                        try:
                            s3_client.head_object(Bucket=model_bucket, Key=model_key)
                            inputs['models'] = '{0}{1}'.format(models_s3uri, model_name[0 : -5])
                        except ClientError as e:
                            if e.response['Error']['Code'] == "404":
                                hyperparameters['model-name'] = model_name
                                if 'models' in inputs:
                                    inputs.pop('models')
                            else:
                                raise e

            else:
                train_args = json.loads(json.loads(hyperparameters['train-args']))
                train_dreambooth_settings = train_args['train_dreambooth_settings']
                if 'lora' not in inputs and train_dreambooth_settings['db_lora_model_name'] != '' :
                    with_lora =  s3uri_contain_files(lora_s3uri)
                    if with_lora:
                        inputs['lora'] = lora_s3uri
                if 'dreambooth' not in inputs and not train_dreambooth_settings['db_create_new_db_model']:
                    with_dreambooth = s3uri_contain_files(dreambooth_s3uri)
                    if with_dreambooth:
                        inputs['dreambooth'] = dreambooth_s3uri
                if 'db-models-s3uri' not in hyperparameters:
                    hyperparameters['db-models-s3uri'] = dreambooth_s3uri
                if 'sd-models-s3uri' not in hyperparameters:
                    hyperparameters['sd-models-s3uri'] = models_s3uri
                if 'lora-models-s3uri' not in hyperparameters:
                    hyperparameters['lora-models-s3uri'] = lora_s3uri

                if 'models' not in inputs or inputs['models'] == '':
                    if train_dreambooth_settings['db_create_new_db_model'] and not train_dreambooth_settings['db_create_from_hub']:
                        model_name = train_dreambooth_settings['db_new_model_src']
                        found_in_models_subdir = False
                        model_bucket, model_key = get_bucket_and_key('{0}{1}/{2}'.format(models_s3uri, username, model_name))
                        try:
                            s3_client.head_object(Bucket=model_bucket, Key=model_key)
                            inputs['models'] = '{0}{1}/{2}'.format(models_s3uri, username, model_name[0 : -5])
                            found_in_models_subdir = True
                        except ClientError as e:
                            if e.response['Error']['Code'] == "404":
                                pass
                            else:
                                raise e
                        if not found_in_models_subdir:
                            model_bucket, model_key = get_bucket_and_key('{0}{1}'.format(models_s3uri, model_name))
                            try:
                                s3_client.head_object(Bucket=model_bucket, Key=model_key)
                                inputs['models'] = '{0}{1}'.format(models_s3uri, model_name[0 : -5])
                            except ClientError as e:
                                if e.response['Error']['Code'] == "404":
                                    hyperparameters['model-name'] = model_name
                                    if 'models' in inputs:
                                        inputs.pop('models')
                                else:
                                    raise e

            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'image_uri': image_uri,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'subnets': [ os.environ['PrivateSubnet1'], os.environ['PrivateSubnet2'] ],
                    'security_group_ids': [ os.environ['SecurityGroup'] ],
                    'inputs': inputs,
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_generic',
                Payload=json.dumps(payload)
            )
        elif(algorithm == 'wenet'):       
            image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/training_image'.format(algorithm))

            default_hyperparameters = {
                'stage': '4',
                'stop_stage': '4', 
                'set': 'XS', 
                'data': '/opt/ml/input/data/processed',
                'dir':  '/opt/ml/model',
                'giga_data_dir': '/opt/ml/input/data/raw-data',
                'shards_dir':    '/opt/ml/input/data/shards',
                'num_nodes':     str(instance_count),
                'CUDA_VISIBLE_DEVICES': '0'
            }

            for key in default_hyperparameters.keys():
                if(key not in hyperparameters.keys()):
                    hyperparameters[key] = default_hyperparameters[key]

            payload = {
                'body': {
                    'job_name': job_name,
                    'industrial_model': industrial_model,
                    'role': role_arn,
                    'image_uri': image_uri,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_generic',
                InvocationType = 'Event',
                Payload=json.dumps(payload)
            )
            payload = json.loads(response['Payload'].read().decode('utf-8'))
            if payload['statusCode'] == 200:
                job_name = payload['body']
                url_prefix = get_all_in_one_ai_url()
                modelid = get_all_in_one_ai_url_model_id(job_name)
                url = url_prefix+'/imodels/'+modelid+'?tab=trainingjob#prop:id='+job_name
                return {
                    'statusCode': 200,
                    'body': json.dumps(url, default = defaultencode)
                }
            else:
                return {
                    'statusCode': payload['statusCode'],
                    'body': payload['body']
                }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported algorithm'
            }
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + ' is not JSON serializable')

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key

def s3uri_contain_files(s3uri):
    bucket, key = get_bucket_and_key(s3uri)
    s3_bucket = s3_resource.Bucket(bucket)
    objs = list(s3_bucket.objects.filter(Prefix=key))
    return len(objs) > 1
