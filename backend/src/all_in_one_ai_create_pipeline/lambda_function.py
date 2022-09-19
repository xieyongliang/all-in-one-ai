import json
import boto3
import traceback
from datetime import datetime
import sagemaker
from sagemaker.workflow.condition_step import ConditionStep
from sagemaker.workflow.fail_step import FailStep
from sagemaker.workflow.pipeline import Pipeline
from sagemaker.estimator import Estimator
from sagemaker.lambda_helper import Lambda
from sagemaker.workflow.steps import TrainingStep
from sagemaker.workflow.step_collections import RegisterModel
from sagemaker.workflow.lambda_step import LambdaStep
from sagemaker.workflow.lambda_step import (
    LambdaStep,
    LambdaOutput,
    LambdaOutputTypeEnum,
)
from sagemaker.lambda_helper import Lambda
from sagemaker.workflow.conditions import ConditionEquals
from sagemaker.pytorch import PyTorch
from sagemaker.mxnet import MXNet
from sagemaker.tensorflow import TensorFlow
from sagemaker.huggingface import HuggingFace
import helper

ssmh = helper.ssm_helper()

sagemaker_client = boto3.client("sagemaker")

lambda_client = boto3.client('lambda')

boto_session = boto3.Session()

sagemaker_session = sagemaker.session.Session(boto_session=boto_session, sagemaker_client = sagemaker_client)

def lambda_handler(event, context):
    print(event)

    time = datetime.now()

    pipeline_name = event['body']['pipeline_name']
    pipeline_type = event['body']['pipeline_type']
    pipeline_id = event['body']['pipeline_id']
    role = event['body']['role']
    lambda_arn = event['body']['lambda_arn']
    script_mode = event['body']['script_mode']

    industrial_model = event['body']['industrial_model']
    model_algorithm = event['body']['model_algorithm']

    if(script_mode): 
        training_job_hyperparameters = event['body']['training_job_hyperparameters'] if('training_job_hyperparameters' in event['body']) else {}
        training_job_instance_type = event['body']['training_job_instance_type']
        training_job_instance_count = event['body']['training_job_instance_count']
        training_job_input_data = event['body']['training_job_input_data']
        model_name = event['body']['model_name']
        model_environment = json.dumps(event['body']['model_environment'])
        endpoint_name = event['body']['endpoint_name']
        endpoint_instance_type = event['body']['endpoint_instance_type']
        endpoint_initial_instance_count = event['body']['endpoint_initial_instance_count']
    else:
        inference_image = event['body']['inference_image']
        if(inference_image == ''):
            try: 
                inference_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/inference_image'.format(model_algorithm))
            except Exception as e:
                print(e)     
        model_name = event['body']['model_name']
        model_package_group_inference_instances = event['body']['model_package_group_inference_instances']
        model_environment = json.dumps(event['body']['model_environment'])
        endpoint_config_name = event['body']['endpoint_config_name']
        endpoint_name = event['body']['endpoint_name']
        endpoint_instance_type = event['body']['endpoint_instance_type']
        endpoint_initial_instance_count = event['body']['endpoint_initial_instance_count']
        endpoint_initial_variant_weight = event['body']['endpoint_initial_variant_weight']
        
        if(pipeline_type == '0'):
            training_image = event['body']['training_image']
            if(training_image == ''):
                try: 
                    training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/training_image'.format(model_algorithm))
                except Exception as e:
                    print(e)
            training_job_instance_type = event['body']['training_job_instance_type']
            training_job_instance_count = event['body']['training_job_instance_count']
            training_job_volume_size_in_gb = event['body']['training_job_volume_size_in_gb']
            training_job_input_data = event['body']['training_job_input_data']
            training_job_output_s3uri = event['body']['training_job_output_s3uri']
            greengrass_component_name = event['body']['greengrass_component_name']
            model_package_group_name = event['body']['model_package_group_name']
            greengrass_component_version = event['body']['greengrass_component_version']
            greengrass_deployment_name = event['body']['greengrass_deployment_name']
            greengrass_deployment_components = event['body']['greengrass_deployment_components']
            greengrass_deployment_target_arn = event['body']['greengrass_deployment_target_arn']
        elif(pipeline_type == '1'):
            training_image = event['body']['training_image']
            if(training_image == ''):
                try: 
                    training_image = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/training_image'.format(model_algorithm))
                except Exception as e:
                    print(e)            
            training_job_instance_type = event['body']['training_job_instance_type']
            training_job_instance_count = event['body']['training_job_instance_count']
            training_job_volume_size_in_gb = event['body']['training_job_volume_size_in_gb']
            training_job_input_data = event['body']['training_job_input_data']
            training_job_output_s3uri = event['body']['training_job_output_s3uri']
            model_package_group_name = event['body']['model_package_group_name']
        elif(pipeline_type == '2'):
            model_package_arn = event['body']['model_package_arn']
            greengrass_component_name = event['body']['greengrass_component_name']
            greengrass_component_version = event['body']['greengrass_component_version']
            model_data_url = event['body']['model_data_url']
            if(model_data_url == ''):
                try: 
                    model_data_url = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/artifact'.format(model_algorithm))
                except Exception as e:
                    print(e)
            greengrass_deployment_name = event['body']['greengrass_deployment_name']
            greengrass_deployment_components = event['body']['greengrass_deployment_components']
            greengrass_deployment_target_arn = event['body']['greengrass_deployment_target_arn']
        else:
            model_package_arn = event['body']['model_package_arn']

    if(script_mode):
        if(model_algorithm == 'yolov5'):
            default_hyperparameters = {
                'data': '/opt/ml/input/data/cfg/data.yaml', 
                'cfg': 'yolov5s.yaml', 
                'weight': 'yolov5s.pt', 
                'project': '/opt/ml/model/',
                'name': 'tutorial', 
                'img': 640, 
                'batch': 16, 
                'epochs': 10
            }
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]
            
            git_config = {'repo': 'https://github.com/ultralytics/yolov5.git', 'branch': 'master'}
            entry_point = 'train.py'
            source_dir = '.'
            framework_version = '1.10.2'
            py_version = 'py38'

            estimator = PyTorch(
                entry_point = entry_point,
                source_dir = source_dir,
                git_config = git_config,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'gluoncv'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))

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
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]

            entry_point = 'finetune.py'
            framework_version = '1.8.0'
            py_version = 'py37'
            estimator = MXNet(
                entry_point = entry_point,
                source_dir = source_dir,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'cpt'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))

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
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]

            entry_point = 'train.py'
            py_version = 'py38'
            transformers_version = '4.12.3'
            pytorch_version='1.9.0'
            estimator = HuggingFace(
                entry_point = entry_point,
                source_dir = source_dir,
                role = role,
                hyperparameters = training_job_hyperparameters,
                py_version = py_version,
                transformers_version = transformers_version,
                pytorch_version = pytorch_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'gabsa'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))

            default_hyperparameters = {
                "task" : "tasd", 
                "dataset" : "dataset", 
                "model_name_or_path" : "t5-base", 
                "paradigm": "extraction",
                "eval_batch_size" :"16",
                "train_batch_size" :"2",
                "learning_rate" :"3e-4",
                "num_train_epochs":"1",
                "n_gpu": "1"
            }
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]
            
            git_config = None
            entry_point = 'train.py'
            framework_version = '1.7.1'
            py_version = 'py36'

            estimator = PyTorch(
                entry_point = entry_point,
                source_dir = source_dir,
                git_config = git_config,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'paddlenlp'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))

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
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]
            
            git_config = None
            entry_point = 'finetune.py'
            framework_version = '1.9.0'
            py_version = 'py38'

            estimator = PyTorch(
                entry_point = entry_point,
                source_dir = source_dir,
                git_config = git_config,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'paddleocr'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))
            
            git_config = None
            entry_point = 'train.py'
            framework_version = '2.2.2'
            py_version = 'py37'

            estimator = TensorFlow(
                entry_point = entry_point,
                source_dir = source_dir,
                git_config = git_config,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        elif(model_algorithm == 'gluonts'):
            source_dir = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/{0}/source'.format(model_algorithm))

            default_hyperparameters = {
                'algo-name': 'DeepAR', 
                'freq': '1M', 
                'prediction-length': 2*12, 
                'context-length': 20*12, 
                'epochs': 200, 
                'batch-size': 2048  , 
                'num-batches-per-epoch': 2
            }
            training_job_hyperparameters = training_job_hyperparameters
            for key in default_hyperparameters.keys():
                if(key not in training_job_hyperparameters.keys()):
                    training_job_hyperparameters[key] = default_hyperparameters[key]

            entry_point = 'train.py'
            framework_version = '1.9.0'
            py_version = 'py38'
            estimator = MXNet(
                entry_point = entry_point,
                source_dir = source_dir,
                role = role,
                hyperparameters = training_job_hyperparameters,
                framework_version = framework_version, 
                py_version = py_version,
                instance_type = training_job_instance_type,
                instance_count = training_job_instance_count
            )
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported algorithm'
            }

        inputs = training_job_input_data

        step_train_model = TrainingStep(
            name = 'TrainingJob',
            estimator = estimator,
            inputs = inputs
        )
    
        inputs = {
            'role_arn': role,
            'pipeline_name' : pipeline_name,
            'pipeline_type' : pipeline_type,
            'pipeline_id': pipeline_id,
            'script_mode': script_mode,
            'industrial_model' : industrial_model,
            'model_name' : model_name,
            'model_algorithm': model_algorithm,
            'model_data_url': step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
            'model_environment': model_environment,
            'endpoint_name': endpoint_name,
            'instance_type': endpoint_instance_type,
            'initial_instance_count': endpoint_initial_instance_count
        }

    elif(pipeline_type == '0' or pipeline_type =='1'):
        estimator = Estimator(
            image_uri = training_image,
            role = role,
            instance_count = training_job_instance_count,
            instance_type = training_job_instance_type,
            volume_size = training_job_volume_size_in_gb,
            output_path = training_job_output_s3uri,
            sagemaker_session = sagemaker_session
        )
        
        inputs = training_job_input_data
    
        step_train_model = TrainingStep(
            name = 'TrainingJob',
            estimator = estimator,
            inputs = inputs
        )
    
        step_register_model = RegisterModel(
            name = "RegisterModel",
            estimator = estimator,
            model_data = step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
            content_types = ['image/png', 'image/jpg', 'image/jpeg'],
            response_types = ['application/json'],
            inference_instances = model_package_group_inference_instances.split(','),
            transform_instances = ['ml.g4dn.xlarge'],
            model_package_group_name = model_package_group_name,
            approval_status = "Approved"
        )
    
        if(pipeline_type == '0'):
            inputs = {
                'role_arn': role,
                'pipeline_name' : pipeline_name,
                'pipeline_type' : pipeline_type,
                'pipeline_id': pipeline_id,
                'script_mode': script_mode,
                'industrial_model' : industrial_model,
                'model_name' : model_name,
                'model_algorithm': model_algorithm,
                'model_environment': model_environment,
                'model_package_arn': step_register_model.steps[0].properties.ModelPackageArn,
                'inference_image': inference_image,
                'endpoint_config_name' : endpoint_config_name,
                'endpoint_name': endpoint_name,
                'instance_type': endpoint_instance_type,
                'initial_instance_count': endpoint_initial_instance_count,
                'initial_variant_weight': endpoint_initial_variant_weight,
                'component_name' : greengrass_component_name,
                'component_version' : greengrass_component_version,
                'model_data_url' : step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
                'components' : greengrass_deployment_components,
                'target_arn' : greengrass_deployment_target_arn
            }
            if(greengrass_deployment_name != ''):
                inputs.update(
                    {
                        'deployment_name' : greengrass_deployment_name
                    }
                )
        elif(pipeline_type == '1'):
            inputs = {
                'role_arn': role,
                'pipeline_name' : pipeline_name,
                'pipeline_type' : pipeline_type,
                'pipeline_id': pipeline_id,
                'script_mode': script_mode,
                'industrial_model' : industrial_model,
                'model_name' : model_name,
                'model_algorithm': model_algorithm,
                'model_environment': model_environment,
                'model_package_arn': step_register_model.steps[0].properties.ModelPackageArn,
                'inference_image': inference_image,
                'endpoint_config_name' : endpoint_config_name,
                'endpoint_name': endpoint_name,
                'instance_type': endpoint_instance_type,
                'initial_instance_count': endpoint_initial_instance_count,
                'initial_variant_weight': endpoint_initial_variant_weight
            }
        elif(pipeline_type == '2'):
            inputs = {
                'role_arn': role,
                'pipeline_name' : pipeline_name,
                'pipeline_type' : pipeline_type,
                'pipeline_id': pipeline_id,
                'script_mode': script_mode,
                'industrial_model' : industrial_model,
                'model_name' : model_name,
                'model_algorithm': model_algorithm,
                'model_environment': model_environment,
                'model_package_arn': model_package_arn,
                'inference_image': inference_image,
                'endpoint_config_name' : endpoint_config_name,
                'endpoint_name': endpoint_name,
                'instance_type': endpoint_instance_type,
                'initial_instance_count': endpoint_initial_instance_count,
                'initial_variant_weight': endpoint_initial_variant_weight,
                'component_name' : greengrass_component_name,
                'component_version' : greengrass_component_version,
                'model_data_url' : model_data_url,
                'components' : greengrass_deployment_components,
                'target_arn' : greengrass_deployment_target_arn
            }
            if(greengrass_deployment_name != ''):
                inputs.update(
                    {
                        'deployment_name' : greengrass_deployment_name
                    }
                )
        elif(pipeline_type == '3'):
            inputs = {
                'role_arn': role,
                'pipeline_name' : pipeline_name,
                'pipeline_type' : pipeline_type,
                'pipeline_id': pipeline_id,
                'script_mode': script_mode,
                'industrial_model' : industrial_model,
                'model_name' : model_name,
                'model_algorithm': model_algorithm,
                'model_environment': model_environment,
                'model_package_arn': model_package_arn,
                'inference_image': inference_image,
                'endpoint_config_name' : endpoint_config_name,
                'endpoint_name': endpoint_name,
                'instance_type': endpoint_instance_type,
                'initial_instance_count': endpoint_initial_instance_count,
                'initial_variant_weight': endpoint_initial_variant_weight
            }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported pipeline type'
            }
    

    output_1 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_2 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)
    
    step_pipeline_helper_lambda = LambdaStep(
        name='HelperLambda',
        lambda_func=Lambda(
            function_arn = lambda_arn,
            timeout = 900
        ),
        inputs = inputs,
        outputs = [output_1, output_2]
    )
    
    step_fail_pipeline_helper_lambda = FailStep(
        name="HelperLambdaFail",
        error_message = step_pipeline_helper_lambda.properties.Outputs['body'] 
    )
    
    cond_eq_pipeline_helper_lambda = ConditionEquals(
        left = step_pipeline_helper_lambda.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_pipeline_helper_lambda = ConditionStep(
        name ="HelperLambdaCondition",
        conditions = [cond_eq_pipeline_helper_lambda],
        if_steps = [],
        else_steps = [step_fail_pipeline_helper_lambda]
    )
    
    try:
        if(script_mode):
            pipeline = Pipeline(
                name = pipeline_name,
                steps = [step_train_model, step_pipeline_helper_lambda, step_cond_pipeline_helper_lambda]
            )
        elif(pipeline_type == '0' or pipeline_type == '1'):
            pipeline = Pipeline(
                name = pipeline_name,
                steps = [step_train_model, step_register_model, step_pipeline_helper_lambda, step_cond_pipeline_helper_lambda]
            )
        else:
            pipeline = Pipeline(
                name = pipeline_name,
                steps = [step_pipeline_helper_lambda, step_cond_pipeline_helper_lambda]
            )

        print(pipeline.definition())
        pipeline.upsert(role_arn=role)

        response = pipeline.start()

        traceback.print_exc()

        payload = {
            'body': {
                'time': time,
                'type': 'pipeline',
                'status': 1             
            }
        }

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_websocket_send_message',
            InvocationType = 'RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 200,
            'body': response.arn
        }

    except Exception as e:
        traceback.print_exc()

        payload = {
            'body': {
                'time': time,
                'type': 'pipeline',
                'status': -1,
                'message': str(e)                
            }
        }

        response = lambda_client.invoke(
            FunctionName = 'all_in_one_ai_websocket_send_message',
            InvocationType = 'RequestResponse',
            Payload=json.dumps(payload)
        )

        return {
            'statusCode': 400,
            'body': str(e)
        }