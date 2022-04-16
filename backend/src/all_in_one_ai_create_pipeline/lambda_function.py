import boto3
import sagemaker
from sagemaker.workflow.condition_step import ConditionStep
from sagemaker.workflow.fail_step import FailStep
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
from sagemaker.workflow.conditions import ConditionEquals

sagemaker_client = boto3.client("sagemaker")

boto_session = boto3.Session()

sagemaker_session = sagemaker.session.Session(boto_session=boto_session, sagemaker_client = sagemaker_client)

def lambda_handler(event, context):
    print(event)
    pipeline_name = event['body']['pipeline_name']
    pipeline_type = event['body']['pipeline_type']
    pipeline_id = event['body']['pipeline_id']
    role = event['body']['role']
    lambda_arn = event['body']['lambda_arn']

    if(pipeline_type == '0'):
        training_image = event['body']['training_image']
        training_job_instance_type = event['body']['training_job_instance_type']
        training_job_instance_count = event['body']['training_job_instance_count']
        training_job_volume_size_in_gb = event['body']['training_job_volume_size_in_gb']
        training_job_images_s3uri = event['body']['training_job_images_s3uri']
        training_job_labels_s3uri = event['body']['training_job_labels_s3uri']
        training_job_weights_s3uri = event['body']['training_job_weights_s3uri']
        training_job_cfg_s3uri = event['body']['training_job_cfg_s3uri']
        training_job_output_s3uri = event['body']['training_job_output_s3uri']
        greengrass_component_name = event['body']['greengrass_component_name']
        model_package_group_name = event['body']['model_package_group_name']
        greengrass_component_version = event['body']['greengrass_component_version']
        greengrass_deployment_name = event['body']['greengrass_deployment_name']
        greengrass_deployment_components = event['body']['greengrass_deployment_components']
        greengrass_deployment_target_arn = event['body']['greengrass_deployment_target_arn']
    elif(pipeline_type == '1'):
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
    elif(pipeline_type == '2'):
        model_package_arn = event['body']['model_package_arn']
        greengrass_component_name = event['body']['greengrass_component_name']
        greengrass_component_version = event['body']['greengrass_component_version']
        model_data_url = event['body']['model_data_url']
        greengrass_deployment_name = event['body']['greengrass_deployment_name']
        greengrass_deployment_components = event['body']['greengrass_deployment_components']
        greengrass_deployment_target_arn = event['body']['greengrass_deployment_target_arn']
    else:
        model_package_arn = event['body']['model_package_arn']

    industrial_model = event['body']['industrial_model']
    model_algorithm = event['body']['model_algorithm']
    inference_image = event['body']['inference_image']
    model_name = event['body']['model_name']
    model_package_group_inference_instances = event['body']['model_package_group_inference_instances']
    model_environment = event['body']['environment']
    endpoint_config_name = event['body']['endpoint_config_name']
    endpoint_name = event['body']['endpoint_name']
    endpoint_instance_type = event['body']['endpoint_instance_type']
    endpoint_initial_instance_count = event['body']['endpoint_initial_instance_count']
    endpoint_initial_variant_weight = event['body']['endpoint_initial_variant_weight']

    if(pipeline_type == '0'):
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
        param_greengrass_component_name = ParameterString(name = 'greengrass_component_name')
        param_greengrass_component_version = ParameterString(name = 'greengrass_component_version')
        param_greengrass_deployment_name = ParameterString(name = 'greengrass_deployment_name')
        param_greengrass_deployment_components = ParameterString(name = 'greengrass_deployment_components')
        param_greengrass_deployment_target_arn = ParameterString(name = 'greengrass_deployment_target_arn')
    elif(pipeline_type == '1'):
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
    elif(pipeline_type == '2'):
        param_model_package_arn = ParameterString(name = 'model_package_arn')
        param_greengrass_component_name = ParameterString(name = 'greengrass_component_name')
        param_greengrass_component_version = ParameterString(name = 'greengrass_component_version')
        param_greengrass_deployment_name = ParameterString(name = 'greengrass_deployment_name')
        param_greengrass_deployment_components = ParameterString(name = 'greengrass_deployment_components')
        param_greengrass_deployment_target_arn = ParameterString(name = 'greengrass_deployment_target_arn')
        param_model_data_url = ParameterString(name = 'model_data_url')
    else:
        param_model_package_arn = ParameterString(name = 'model_package_arn')
        
    param_industrial_model = ParameterString(name = 'industrial_model')
    param_model_algorithm = ParameterString(name = 'model_algorithm')
    param_inference_image = ParameterString(name = 'inference_image')
    param_model_package_group_inference_instances = ParameterString(name = 'model_package_group_inference_instances')
    param_model_environment = ParameterString(name = 'model_environment')
    param_model_name = ParameterString(name = 'model_name')
    param_endpoint_config_name = ParameterString(name = 'endpoint_config_name')
    param_endpoint_name = ParameterString(name = 'endpoint_name')
    param_endpoint_instance_type = ParameterString(name = 'endpoint_instance_type')
    param_endpoint_initial_instance_count = ParameterInteger(name = 'endpoint_initial_instance_count')
    param_endpoint_initial_variant_weight = ParameterInteger(name = 'endpoint_initial_variant_weight')

    if(pipeline_type == '0' or pipeline_type =='1'):
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
    
        step_register_model = RegisterModel(
            name = "Yolov5RegisterModel",
            estimator=estimator,
            model_data=step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
            content_types = ['image/png', 'image/jpg', 'image/jpeg'],
            response_types = ['application/json'],
            inference_instances = param_model_package_group_inference_instances.split(','),
            transform_instances = ['ml.g4dn.xlarge'],
            model_package_group_name = param_model_package_group_name,
            approval_status = "Approved",
        )
    
    if(pipeline_type == '0'):
        inputs = {
            'pipeline_name' : pipeline_name,
            'pipeline_type' : pipeline_type,
            'pipeline_id': pipeline_id,
            'industrial_model' : param_industrial_model,
            'model_algorithm': param_model_algorithm,
            'model_name' : param_model_name,
            'endpoint_config_name' : param_endpoint_config_name,
            'endpoint_name' : param_endpoint_name,
            'industrial_model': param_industrial_model,
            'role_arn': role,
            'model_name': param_model_name,
            'environment': param_model_environment,
            'model_package_arn': step_register_model.steps[0].properties.ModelPackageArn,
            'endpoint_name': param_endpoint_name,
            'instance_type': param_endpoint_instance_type,
            'initial_instance_count': param_endpoint_initial_instance_count,
            'initial_variant_weight': param_endpoint_initial_variant_weight,
            'component_name' : param_greengrass_component_name,
            'component_version' : param_greengrass_component_version,
            'model_data_url' : step_train_model.properties.ModelArtifacts.S3ModelArtifacts,
            'components' : param_greengrass_deployment_components,
            'target_arn' : param_greengrass_deployment_target_arn
        }
        if(greengrass_deployment_name != ''):
            inputs.update(
                {
                    'deployment_name' : param_greengrass_deployment_name
                }
            )
    elif(pipeline_type == '1'):
        inputs = {
            'pipeline_name' : pipeline_name,
            'pipeline_type' : pipeline_type,
            'pipeline_id': pipeline_id,
            'industrial_model' : param_industrial_model,
            'model_algorithm': param_model_algorithm,
            'model_name' : param_model_name,
            'endpoint_config_name' : param_endpoint_config_name,
            'endpoint_name' : param_endpoint_name,
            'industrial_model': param_industrial_model,
            'role_arn': role,
            'model_name': param_model_name,
            'environment': param_model_environment,
            'model_package_arn': step_register_model.steps[0].properties.ModelPackageArn,
            'model_name': param_model_name,
            'endpoint_name': param_endpoint_name,
            'instance_type': param_endpoint_instance_type,
            'initial_instance_count': param_endpoint_initial_instance_count,
            'initial_variant_weight': param_endpoint_initial_variant_weight
        }
    elif(pipeline_type == '2'):
        inputs = {
            'pipeline_name' : pipeline_name,
            'pipeline_type' : pipeline_type,
            'pipeline_id': pipeline_id,
            'industrial_model' : param_industrial_model,
            'model_algorithm': param_model_algorithm,
            'model_name' : param_model_name,
            'endpoint_config_name' : param_endpoint_config_name,
            'endpoint_name' : param_endpoint_name,
            'industrial_model': param_industrial_model,
            'role_arn': role,
            'model_name': param_model_name,
            'environment': param_model_environment,
            'model_package_arn': param_model_package_arn,
            'endpoint_name': param_endpoint_name,
            'instance_type': param_endpoint_instance_type,
            'initial_instance_count': param_endpoint_initial_instance_count,
            'initial_variant_weight': param_endpoint_initial_variant_weight,
            'component_name' : param_greengrass_component_name,
            'component_version' : param_greengrass_component_version,
            'model_data_url' : param_model_data_url,
            'components' : param_greengrass_deployment_components,
            'target_arn' : param_greengrass_deployment_target_arn
        }
        if(greengrass_deployment_name != ''):
            inputs.update(
                {
                    'deployment_name' : param_greengrass_deployment_name
                }
            )
    elif(pipeline_type == '3'):
        inputs = {
            'pipeline_name' : pipeline_name,
            'pipeline_type' : pipeline_type,
            'pipeline_id': pipeline_id,
            'industrial_model' : param_industrial_model,
            'model_algorithm': param_model_algorithm,
            'model_name' : param_model_name,
            'endpoint_config_name' : param_endpoint_config_name,
            'endpoint_name' : param_endpoint_name,
            'industrial_model': param_industrial_model,
            'role_arn': role,
            'model_name': param_model_name,
            'environment': param_model_environment,
            'model_package_arn': param_model_package_arn,
            'endpoint_name': param_endpoint_name,
            'instance_type': param_endpoint_instance_type,
            'initial_instance_count': param_endpoint_initial_instance_count,
            'initial_variant_weight': param_endpoint_initial_variant_weight
        }
    else:
        return {
            'statusCode': 400,
            'body': 'Unsupported pipeline_type'
        }
    

    output_param_1 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_param_2 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)
    
    step_pipeline_helper_lambda = LambdaStep(
        name='Yolov5PipelineHelperLambda',
        lambda_func=Lambda(
            function_arn = lambda_arn,
            timeout = 900
        ),
        inputs = inputs,
        outputs = [output_param_1, output_param_2]
    )
    
    step_fail_pipeline_helper_lambda = FailStep(
        name="Yolov5PipelineHelperLambdaFail",
        error_message = step_pipeline_helper_lambda.properties.Outputs['body'] 
    )
    
    cond_eq_pipeline_helper_lambda = ConditionEquals(
        left = step_pipeline_helper_lambda.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_pipeline_helper_lambda = ConditionStep(
        name ="Yolov5PipelineHelperLambdaCondition",
        conditions = [cond_eq_pipeline_helper_lambda],
        if_steps = [],
        else_steps = [step_fail_pipeline_helper_lambda]
    )

    parameters = [
        param_industrial_model,
        param_model_algorithm,
        param_inference_image,
        param_model_package_group_inference_instances,
        param_model_name,
        param_model_environment,
        param_endpoint_config_name,
        param_endpoint_name,
        param_endpoint_instance_type,
        param_endpoint_initial_instance_count,
        param_endpoint_initial_variant_weight
    ]

    if(pipeline_type == '0'):
        parameters += [
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
            param_greengrass_component_name,
            param_greengrass_component_version,
            param_greengrass_deployment_components,
            param_greengrass_deployment_target_arn
        ]
        if(greengrass_deployment_name != ''):
            parameters += [
                param_greengrass_deployment_name
            ]
    elif(pipeline_type == '1'):
        parameters += [
            param_training_image,
            param_training_job_instance_type,
            param_training_job_instance_count,
            param_training_job_volume_size_in_gb,
            param_training_job_images_s3uri,
            param_training_job_labels_s3uri,
            param_training_job_weights_s3uri,
            param_training_job_cfg_s3uri,
            param_training_job_output_s3uri,
            param_model_package_group_name
        ]
    elif(pipeline_type == '2'):
        parameters += [
            param_model_package_arn,
            param_greengrass_component_name,
            param_greengrass_component_version,
            param_model_data_url,
            param_greengrass_deployment_components,
            param_greengrass_deployment_target_arn
        ]
        if(greengrass_deployment_name != ''):
            parameters += [
                param_greengrass_deployment_name
            ]

    else:
        parameters += [
            param_model_package_arn
        ]
    
    if(pipeline_type == '0' or pipeline_type == '1'):
        pipeline = Pipeline(
            name = pipeline_name,
            parameters = parameters,
            steps = [step_train_model, step_register_model, step_pipeline_helper_lambda, step_cond_pipeline_helper_lambda]
        )
    else:
        pipeline = Pipeline(
            name = pipeline_name,
            parameters = parameters,
            steps = [step_pipeline_helper_lambda, step_cond_pipeline_helper_lambda]
        )

    print(pipeline.definition())
    pipeline.upsert(role_arn=role)

    parameters = {
        'industrial_model': industrial_model,
        'model_algorithm': model_algorithm,
        'inference_image': inference_image,
        'model_package_group_inference_instances': model_package_group_inference_instances,
        'model_name': model_name,
        'model_environment': model_environment,
        'endpoint_config_name': endpoint_config_name,
        'endpoint_name': endpoint_name,
        'endpoint_instance_type': endpoint_instance_type,
        'endpoint_initial_instance_count': endpoint_initial_instance_count,
        'endpoint_initial_variant_weight': endpoint_initial_variant_weight
    }

    if(pipeline_type == '0'):
        parameters.update(
            {
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
                'greengrass_component_name': greengrass_component_name,
                'greengrass_component_version': greengrass_component_version,
                'greengrass_deployment_components': greengrass_deployment_components,
                'greengrass_deployment_target_arn': greengrass_deployment_target_arn
            }
        )
        if(greengrass_deployment_name != ''):
            parameters.update(
                {
                    'greengrass_deployment_name': greengrass_deployment_name
                }
            )

    elif(pipeline_type == '1'):
        parameters.update(
            {
                'training_image': training_image,
                'training_job_instance_type': training_job_instance_type,
                'training_job_instance_count': training_job_instance_count,
                'training_job_volume_size_in_gb': training_job_volume_size_in_gb,
                'training_job_images_s3uri': training_job_images_s3uri,
                'training_job_labels_s3uri': training_job_labels_s3uri,
                'training_job_weights_s3uri': training_job_weights_s3uri,
                'training_job_cfg_s3uri': training_job_cfg_s3uri,
                'training_job_output_s3uri': training_job_output_s3uri,
                'model_package_group_name': model_package_group_name
            }
        )
    elif(pipeline_type == '2'):
        parameters.update(
            {
                'model_package_arn': model_package_arn,
                'greengrass_component_name': greengrass_component_name,
                'greengrass_component_version': greengrass_component_version,
                'model_data_url': model_data_url,
                'greengrass_deployment_components': greengrass_deployment_components,
                'greengrass_deployment_target_arn': greengrass_deployment_target_arn
            }
        )
        if(greengrass_deployment_name != ''):
            parameters.update(
                {
                    'greengrass_deployment_name': greengrass_deployment_name
                }
            )

    else:
        parameters.update(
            {
                'model_package_arn': model_package_arn
            }
        )
    
    print(parameters)
    response = pipeline.start(parameters =  parameters)
    
    return response.arn
