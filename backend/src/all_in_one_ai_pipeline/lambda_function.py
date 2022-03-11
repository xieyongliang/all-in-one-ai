import json
from sagemaker.workflow.pipeline import Pipeline
from sagemaker.workflow.parameters import (
    ParameterInteger,
    ParameterString,
    ParameterFloat
)
from sagemaker.estimator import Estimator
from sagemaker.inputs import TrainingInput
from sagemaker.workflow.steps import TrainingStep

# Create a Sagemaker Pipeline.
# Each parameter for the pipeline must be set as a parameter explicitly when the pipeline is created.
# Also pass in each of the steps created above.
# Note that the order of execution is determined from each step's dependencies on other steps,
# not on the order they are passed in below.

def lambda_handler(event, context):
    pipeline_name = event['body']['pipeline_name']
    training_job_name = event['body']['training_job_name']
    training_image = event['body']['training_image']
    role_arn = event['body']['role_arn']
    instance_type = event['body']['instance_type']
    instance_count = event['body']['instance_count']
    volume_size_in_gb = event['body']['volume_size_in_gb']
    images_s3uri = event['body']['images_s3uri']
    labels_s3uri = event['body']['labels_s3uri']
    weights_s3uri = event['body']['weights_s3uri']
    cfg_s3uri = event['cfg_s3uri']
    output_s3uri = event['body']['output_s3uri']
    
    estimator=sagemaker.estimator.Estimator(
        image_uri=param_training_image,
        role=param_role_arn,
        instance_count=param_instance_count,
        instance_type=param_instance_type,
        volume_size=param_volume_size_in_gb,
        output_path=param_output_s3uri
    )

    step_train_model = TrainingStep(
        name=param_training_job_name,
        estimator=estimator,
        inputs={
            'images': TrainingInput(
                s3_data=param_images_s3uri
            ),
            'labels': TrainingInput(
                s3_data=param_labels_s3uri
            ),
            'weights':TrainingInput(
                s3_data=param_weights_s3uri
            ),
            'cfg': TrainingInput(
                s3_data=param_cfg_s3uri
            ),
        },
    )

    param_training_job_name = ParameterString(name='training_job_name')
    param_training_image = ParameterString(name='training_image')
    param_role_arn = ParameterString(name='role_arn')
    param_instance_type = ParameterString(name='instance_type')
    param_instance_count = ParameterInteger(name='instance_count')
    param_volume_size_in_gb = ParameterInteger(name='volume_size_in_gb')
    param_images_s3uri = ParameterString(name='images_s3uri')
    param_labels_s3uri = ParameterString(name='labels_s3uri')
    param_weights_s3uri = ParameterString(name='weights_s3uri')
    param_cfg_s3uri = ParameterString(name='cfg_s3uri')
    param_output_s3uri = ParameterString(name='output_s3uri')

    pipeline = Pipeline(
        name=pipeline_name,
        parameters=[
            param_training_job_name,
            param_training_image,
            param_role_arn,
            param_instance_type,
            param_instance_count,
            param_volume_size_in_gb,
            param_images_s3uri,
            param_labels_s3uri,
            param_weights_s3uri,
            param_cfg_s3uri,
            param_output_s3uri
        ],
        steps=[step_train_model]
    )
    execution = pipeline.start(
        parameters=dict(
            training_job_name=training_job_name,
            training_image=training_image,
            role_arn=role_arn,
            instance_type=instance_type,
            instance_count=instance_count,
            volume_size_in_gb=volume_size_in_gb,
            images_s3uri=images_s3uri,
            labels_s3uri=labels_s3uri,
            weights_s3uri=weights_s3uri,
            cfg_s3uri=cfg_s3uri,
            output_s3uri=output_s3uri
        )
    )
    print(execution)
