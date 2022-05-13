import json
import boto3
from decimal import Decimal
from datetime import date, datetime
import traceback
import helper

sagemaker_client = boto3.client('sagemaker')

ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    try:
        algorithm = event['body']['model_algorithm']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        hyperparameters = event['body']['hyperparameters']
        inputs = event['body']['inputs']
                
        if(algorithm == 'yolov5'):
            default_hyperparameters = {
                'data': '/opt/ml/input/data/cfg/data.yaml', 
                'cfg': 'yolov5s.yaml', 
                'weight': '/opt/ml/input/data/weights/yolov5s.pt', 
                'project': '/opt/ml/model/',
                'name': 'tutorial', 
                'img': 640, 
                'batch': 16, 
                'epochs': 100
            }
            for hyperparameter in default_hyperparameters:
                if(hyperparameter not in hyperparameter):
                    hyperparameters[hyperparameter] = default_hyperparameters[hyperparameter]
            
            git_config = {'repo': 'https://github.com/ultralytics/yolov5.git', 'branch': 'master'}
            
            payload = {
                'body': {
                    'entry_point': 'train.py',
                    'source_dir': '.',
                    'git_config': git_config,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'inputs': inputs,
                    'py_version': 'py38',
                    'framework_version': '1.9.1'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_pytorch',
                InvocationType = 'Event',
                Payload=json.dumps({'body': payload})
            )
        elif(algorithm == 'gluoncv'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                "classes": 10, 
                "batch_size": 8,
                "epochs": 20, 
                "learning_rate": 0.001,
                "momentum": 0.9,
                "wd": 0.0001,
                "num_gpus": 1,
                "num_workers": 8,
                "model_name": "ResNet50_v2"
            }
            for hyperparameter in default_hyperparameters:
                if(hyperparameter not in hyperparameter):
                    hyperparameters[hyperparameter] = default_hyperparameters[hyperparameter]
            
            payload = {
                'body': {
                    'entry_point': 'finetune.py',
                    'source_dir': source_dir,
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
                Payload=json.dumps({'body': payload})
            )
        elif(algorithm == 'cpt'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(algorithm))

            default_hyperparameters = {
                'model_name_or_path': 'fnlp/cpt-large',
                'num_train_epochs': 20,
                'per_device_train_batch_size': 4,   
                'text_column': 'text',
                'summary_column': 'summary',
                'output_dir': '/opt/ml/model',
                'train_file': '/opt/ml/input/data/train/train.json',
                'validation_file':'/opt/ml/input/data/validation/val.json',
                'test_file': '/opt/ml/input/data/test/test.json',
                'val_max_target_length': 80,
                'path': 'json'
            }
            for hyperparameter in default_hyperparameters:
                if(hyperparameter not in hyperparameter):
                    hyperparameters[hyperparameter] = default_hyperparameters[hyperparameter]
            
            payload = {
                'body': {
                    'entry_point': 'finetune.py',
                    'source_dir': source_dir,
                    'instance_type': instance_type,
                    'instance_count': instance_count,
                    'hyperparameters': hyperparameters,
                    'transformers_version': '4.17.0',
                    'inputs': inputs,
                    'py_version': 'py37',
                    'framework_version': '1.8.0'
                }
            }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_create_train_huggingface',
                InvocationType = 'Event',
                Payload=json.dumps({'body': payload})
            )


        return {
            'statusCode': 200,
            'body': json.dumps(response, default = defaultencode)
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
    raise TypeError(repr(o) + " is not JSON serializable")