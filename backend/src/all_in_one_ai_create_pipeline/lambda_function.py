import json
import boto3
import sagemaker
from sagemaker.workflow.pipeline import Pipeline
from sagemaker.workflow.parameters import (
    ParameterInteger,
    ParameterString
)
from sagemaker.estimator import Estimator
from sagemaker.model import Model
from sagemaker.lambda_helper import Lambda
from sagemaker.inputs import TrainingInput
from sagemaker.workflow.steps import TrainingStep
from sagemaker.workflow.step_collections import RegisterModel
from sagemaker.workflow.lambda_step import LambdaStep
from sagemaker.workflow.lambda_step import (
    LambdaStep,
    LambdaOutput,
    LambdaOutputTypeEnum,
)
from sagemaker.lambda_helper import Lambda

sagemaker_client = boto3.client("sagemaker")

boto_session = boto3.Session()

sagemaker_session = sagemaker.session.Session(boto_session=boto_session, sagemaker_client = sagemaker_client)

def lambda_handler(event, context):
    print(event)
    pipeline_name = event['body']['pipeline_name']
    case_name = event['body']['case_name']
    role = event['body']['role']
    lambda_arn = event['body']['lambda_arn']
    
    training_image = event['body']['training_image']
    training_job_instance_type = event['body']['training_job_instance_type']
    training_job_instance_count = event['body']['training_job_instance_count']
    training_job_volume_size_in_gb = event['body']['training_job_volume_size_in_gb']
    training_job_images_s3uri = event['body']['training_job_images_s3uri']
    training_job_labels_s3uri = event['body']['training_job_labels_s3uri']
    training_job_weights_s3uri = event['body']['training_job_weights_s3uri']
    training_job_cfg_s3uri = event['body']['training_job_cfg_s3uri']
    training_job_output_s3uri = event['body']['training_job_output_s3uri']
    model_package_group_name = event['body']['model_package_group_name']
    model_package_group_inference_instances = event['body']['model_package_group_inference_instances']
    model_name = event['body']['model_name']
    endpoint_config_name = event['body']['endpoint_config_name']
    endpoint_name = event['body']['endpoint_name']
    endpoint_instance_type = event['body']['endpoint_instance_type']
    endpoint_initial_instance_count = event['body']['endpoint_initial_instance_count']
    endpoint_initial_variant_weight = event['body']['endpoint_initial_variant_weight']
    api_name = event['body']['api_name']
    rest_api_name = event['body']['rest_api_name']
    rest_api_id = event['body']['rest_api_id']
    api_path = event['body']['api_path']
    api_stage = event['body']['api_stage']
    api_function = event['body']['api_function']
    api_method = event['body']['api_method']
    api_env = event['body']['api_env']
    
    param_case_name = ParameterString(name = 'case_name')
    param_training_image = ParameterString(name = 'training_image')
    param_training_job_instance_type = ParameterString(name = 'training_job_instance_type')
    param_training_job_instance_count = ParameterInteger(name = 'training_job_instance_count')
    param_training_job_volume_size_in_gb = ParameterInteger(name = 'training_job_volume_size_in_gb')
    param_training_job_images_s3uri = ParameterString(name = 'training_job_images_s3uri')
    param_training_job_labels_s3uri = ParameterString(name = 'training_job_labels_s3uri')
    param_training_job_weights_s3uri = ParameterString(name = 'training_job_weights_s3uri')
    param_training_job_cfg_s3uri = ParameterString(name = 'training_job_cfg_s3uri')
    param_training_job_output_s3uri = ParameterString(name = 'training_job_output_s3uri')
    param_model_package_group_name = ParameterString(name = 'model_package_group_name')
    param_model_package_group_inference_instances = ParameterString(name = 'model_package_group_inference_instances')
    param_model_name = ParameterString(name = 'model_name')
    param_endpoint_config_name = ParameterString(name = 'endpoint_config_name')
    param_endpoint_name = ParameterString(name = 'endpoint_name')
    param_endpoint_instance_type = ParameterString(name = 'endpoint_instance_type')
    param_endpoint_initial_instance_count = ParameterInteger(name = 'endpoint_initial_instance_count')
    param_endpoint_initial_variant_weight = ParameterInteger(name = 'endpoint_initial_variant_weight')
    param_api_name = ParameterString(name = 'api_name')
    if(rest_api_name != ''):    
        param_rest_api_name = ParameterString(name = 'rest_api_name')
    if(rest_api_id != ''):    
        param_rest_api_id = ParameterString(name = 'rest_api_id')
    param_api_path = ParameterString(name = 'api_path')
    param_api_stage = ParameterString(name = 'api_stage')
    param_api_function = ParameterString(name = 'api_function')
    param_api_method = ParameterString(name = 'api_method')
    param_api_env = ParameterString(name = 'api_env')
    
    estimator = Estimator(
        image_uri = param_training_image,
        role = role,
        instance_count = param_training_job_instance_count,
        instance_type = param_training_job_instance_type,
        volume_size = param_training_job_volume_size_in_gb,
        output_path = param_training_job_output_s3uri,
        sagemaker_session = sagemaker_session
    )
    
    inputs = {
        'images': TrainingInput(s3_data = param_training_job_images_s3uri),
        'labels': TrainingInput(s3_data = param_training_job_labels_s3uri),
        'weights': TrainingInput(s3_data = param_training_job_weights_s3uri),
        'cfg': TrainingInput(s3_data = param_training_job_cfg_s3uri)
    }

    step_train_model = TrainingStep(
        name = 'Yolov5TrainingJob',
        estimator = estimator,
        inputs = inputs
    )
    
    model = Model(
        role = role,
        image_uri = param_training_image,
        model_data = step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
        sagemaker_session = sagemaker_session
    )
    
    step_register_model = RegisterModel(
        name = "Yolov5RegisterModel",
        model = model,
        content_types = ['image/png', 'image/jpg', 'image/jpeg'],
        response_types = ['application/json'],
        inference_instances = param_model_package_group_inference_instances.split(','),
        transform_instances = ['ml.g4dn.xlarge'],
        model_package_group_name = param_model_package_group_name,
        approval_status = "Approved",
    )
    
    output_param_1 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.String)
    output_param_2 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)
    output_param_3 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.String)
    output_param_4 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)
    output_param_5 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.String)
    output_param_6 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)
 
    step_create_endpoint_lambda = LambdaStep(
        name='Yolov5CreateEndpointLambda',
        lambda_func=Lambda(
            function_arn = lambda_arn,
            timeout = 900
        ),
        inputs = {
            'action': 'create_endpoint',
            'case_name': param_case_name,
            'model_name': param_model_name,
            'role_arn': role,
            'model_package_arn': step_register_model.steps[0].properties.ModelPackageArn,
            'endpoint_name': param_endpoint_name,
            'instance_type': param_endpoint_instance_type,
            'initial_instance_count': param_endpoint_initial_instance_count,
            'initial_variant_weight': param_endpoint_initial_variant_weight
        },
        outputs= [output_param_1, output_param_2]
    )

    step_wait_endpoint_lambda = LambdaStep(
        name='Yolov5CheckEndpointLambda',
        lambda_func=Lambda(
            function_arn = lambda_arn,
            timeout = 900
        ),
        inputs = {
            'action': 'wait_endpoint',
            'endpoint_name': param_endpoint_name
        },
        outputs = [output_param_5, output_param_6],
        depends_on = [step_create_endpoint_lambda]
    )

    inputs = {
            'action': 'create_api',
            'case_name': param_case_name,
            'api_name': param_api_name,
            'api_path': param_api_path,
            'api_stage': param_api_stage,
            'api_function': param_api_function,
            'api_method': param_api_method,
            'api_env': param_api_env
        }

    if(rest_api_name != ''):
        inputs['rest_api_name'] = param_rest_api_name
    if(rest_api_id != ''):
        inputs['rest_api_id'] = param_rest_api_id
    
    step_create_api_lambda = LambdaStep(
        name='Yolov5CreateApiLambda',
        lambda_func=Lambda(
            function_arn = lambda_arn,
            timeout = 900
        ),
        inputs = inputs,
        outputs = [output_param_3, output_param_4],
        depends_on = [step_wait_endpoint_lambda]
    )        

    parameters = [
            param_case_name,
            param_training_image,
            param_training_job_instance_type,
            param_training_job_instance_count,
            param_training_job_volume_size_in_gb,
            param_training_job_images_s3uri,
            param_training_job_labels_s3uri,
            param_training_job_weights_s3uri,
            param_training_job_cfg_s3uri,
            param_training_job_output_s3uri,
            param_model_package_group_name,
            param_model_package_group_inference_instances,
            param_model_name,
            param_endpoint_config_name,
            param_endpoint_name,
            param_endpoint_instance_type,
            param_endpoint_initial_instance_count,
            param_endpoint_initial_variant_weight,
            param_api_name,
            param_api_path,
            param_api_stage,
            param_api_function,
            param_api_method,
            param_api_env
        ]

    if(rest_api_name != ''):
        parameters.append(param_rest_api_name)
    if(rest_api_id != ''):
        parameters.append(param_rest_api_id)

    pipeline = Pipeline(
        name = pipeline_name,
        parameters = parameters,
        steps = [step_train_model, step_register_model, step_create_endpoint_lambda, step_wait_endpoint_lambda, step_create_api_lambda]
    )

    print(pipeline.definition())
    pipeline.upsert(role_arn=role)

    api_env = json.dumps({
        'Variables': {
            'endpoint_name_{0}'.format(model_name): endpoint_name
        }
    })

    parameters = {
        'case_name': case_name,
        'training_image': training_image,
        'training_job_instance_type': training_job_instance_type,
        'training_job_instance_count': training_job_instance_count,
        'training_job_volume_size_in_gb': training_job_volume_size_in_gb,
        'training_job_images_s3uri': training_job_images_s3uri,
        'training_job_labels_s3uri': training_job_labels_s3uri,
        'training_job_weights_s3uri': training_job_weights_s3uri,
        'training_job_cfg_s3uri': training_job_cfg_s3uri,
        'training_job_output_s3uri': training_job_output_s3uri,
        'model_package_group_name': model_package_group_name,
        'model_package_group_inference_instances': model_package_group_inference_instances,
        'model_name': model_name,
        'endpoint_config_name': endpoint_config_name,
        'endpoint_name': endpoint_name,
        'endpoint_instance_type': endpoint_instance_type,
        'endpoint_initial_instance_count': endpoint_initial_instance_count,
        'endpoint_initial_variant_weight': endpoint_initial_variant_weight,
        'api_name': api_name,
        'api_path': api_path,
        'api_stage': api_stage,
        'api_function': api_function,
        'api_method': api_method,
        'api_env': api_env
    }
    if(rest_api_name != ''):
        parameters['rest_api_name'] =  rest_api_name
    if(rest_api_id != ''):
        parameters['rest_api_id'] =  rest_api_id
    
    print(parameters)
    pipeline.start(parameters =  parameters)
