from sagemaker.workflow.pipeline import Pipeline
from sagemaker.lambda_helper import Lambda
from sagemaker.workflow.lambda_step import (
    LambdaStep,
    LambdaOutput,
    LambdaOutputTypeEnum,
)
from sagemaker.workflow.steps import TransformStep
from sagemaker.transformer import Transformer
from sagemaker.inputs import TransformInput
from sagemaker.workflow.condition_step import ConditionStep
from sagemaker.workflow.conditions import ConditionEquals
from sagemaker.workflow.fail_step import FailStep
import helper
from datetime import datetime

ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')
add_permission_lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/add_permission_lambda_arn')
remove_permission_lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/remove_permission_lambda_arn')
create_event_notification_lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/create_event_notification_lambda_arn')
delete_event_notification_lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/delete_event_notification_lambda_arn')
import_opensearch_async_helper_lambda_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline/import_opensearch_async_helper_lambda_arn')

def lambda_handler(event, context):
    print(event)

    industrial_model = event['body']['industrial_model']
    transform_job_name = event['body']['transform_job_name']
    model_name = event['body']['model_name']
    max_concurrent_transforms = event['body']['max_concurrent_transforms']
    invocations_timeout_in_seconds = event['body']['invocations_timeout_in_seconds']
    invocations_max_retries = event['body']['invocations_max_retries']
    max_payload_in_mb = event['body']['max_payload_in_mb']
    batch_strategy = event['body']['batch_strategy']
    environment = event['body']['environment'] if('environment' in event['body']) else {}
    s3_data_type = event['body']['s3_data_type']
    input_s3uri = event['body']['input_s3uri']
    content_type = event['body']['content_type']
    compression_type = event['body']['compression_type']
    split_type = event['body']['split_type']   
    output_s3uri = event['body']['output_s3uri']
    accept = event['body']['accept']
    assemble_with = event['body']['assemble_with']
    instance_type = event['body']['instance_type']
    instance_count = event['body']['instance_count']
    input_filter = event['body']['input_filter']
    output_filter = event['body']['output_filter']
    join_source = event['body']['join_source']    
    tags = event['body']['tags'] if('tags' in event['body']) else []

    transformer= Transformer(
        model_name, 
        instance_count, 
        instance_type, 
        strategy = batch_strategy,
        assemble_with = assemble_with, 
        output_path = output_s3uri, 
        accept = accept, 
        max_concurrent_transforms = max_concurrent_transforms, 
        max_payload = max_payload_in_mb, 
        tags = tags, 
        env = environment, 
        base_transform_job_name = transform_job_name
    )

    transformInput = TransformInput(
        input_s3uri, 
        data_type = s3_data_type, 
        content_type = content_type, 
        compression_type = compression_type, 
        split_type = split_type, 
        input_filter = input_filter, 
        output_filter = output_filter, 
        join_source = join_source,
        model_client_config = {
            'InvocationsTimeoutInSeconds': invocations_timeout_in_seconds,
            'InvocationsMaxRetries': invocations_max_retries
        }
    )

    transform_step = TransformStep(
        'TransformStep', 
        step_args = None, 
        transformer = transformer, 
        inputs = transformInput, 
        display_name = None, 
        description = None, 
        cache_config = None, 
        depends_on = None, 
        retry_policies = None
    )

    output_7 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_8 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)

    step_lambda_delete_event_notification= LambdaStep(
        name='DeleteEventNotificationLambda',
        lambda_func=Lambda(
            function_arn = delete_event_notification_lambda_arn,
            timeout = 900
        ),
        inputs = {
            'industrial_model': industrial_model,
            'output_s3uri': output_s3uri
        },
        outputs = [output_7, output_8]
    )

    step_fail_delete_event_notification = FailStep(
        name="DeleteEventNotificationFail",
        error_message = step_lambda_delete_event_notification.properties.Outputs['body'] 
    )
    
    cond_eq_delete_event_notification = ConditionEquals(
        left = step_lambda_delete_event_notification.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_delete_event_notification = ConditionStep(
        name ="DeleteEventNotificationCondition",
        conditions = [cond_eq_delete_event_notification],
        if_steps = [],
        else_steps = [step_fail_delete_event_notification]
    )

    output_5 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_6 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)

    step_lambda_remove_permission = LambdaStep(
        name='RemovePermissionLambda',
        lambda_func=Lambda(
            function_arn = remove_permission_lambda_arn,
            timeout = 900
        ),
        inputs = {
            'industrial_model': industrial_model,
            'lambda_function_arn': import_opensearch_async_helper_lambda_arn,
        },
        outputs = [output_5, output_6],
        depends_on = [transform_step]
    )

    step_fail_remove_permission = FailStep(
        name="RemovePermissionFail",
        error_message = step_lambda_remove_permission.properties.Outputs['body'] 
    )
    
    cond_eq_remove_permission = ConditionEquals(
        left = step_lambda_remove_permission.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_remove_permission = ConditionStep(
        name ="RemovePermissionCondition",
        conditions = [cond_eq_remove_permission],
        if_steps = [step_lambda_delete_event_notification, step_cond_delete_event_notification],
        else_steps = [step_fail_remove_permission]
    )

    output_3 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_4 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)

    step_lambda_add_permission = LambdaStep(
        name='AddPermissionLambda',
        lambda_func=Lambda(
            function_arn = add_permission_lambda_arn,
            timeout = 900
        ),
        inputs = {
            'output_s3uri': output_s3uri,
            'industrial_model': industrial_model,
            'lambda_function_arn': import_opensearch_async_helper_lambda_arn
        },
        outputs = [output_3, output_4]
    )

    fail_step_add_permission = FailStep(
        name="AddPermissionFail",
        error_message = step_lambda_add_permission.properties.Outputs['body'] 
    )
    
    cond_eq_add_permission = ConditionEquals(
        left = step_lambda_add_permission.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_add_permission = ConditionStep(
        name ="AddPermissionCondition",
        conditions = [cond_eq_add_permission],
        if_steps = [transform_step, step_lambda_remove_permission, step_cond_remove_permission],
        else_steps = [fail_step_add_permission]
    )

    output_1 = LambdaOutput(output_name="statusCode", output_type=LambdaOutputTypeEnum.Integer)
    output_2 = LambdaOutput(output_name="body", output_type=LambdaOutputTypeEnum.String)

    step_lambda_create_event_notification= LambdaStep(
        name='CreateEventNotificationLambda',
        lambda_func=Lambda(
            function_arn = create_event_notification_lambda_arn,
            timeout = 900
        ),
        inputs = {
            'output_s3uri': output_s3uri,
            'industrial_model': industrial_model,
            'lambda_function_arn': import_opensearch_async_helper_lambda_arn
        },
        outputs = [output_1, output_2]
    )

    step_fail_create_event_notification = FailStep(
        name="CreateEventNotificationFail",
        error_message = step_lambda_create_event_notification.properties.Outputs['body'] 
    )
    
    cond_eq_create_event_notification = ConditionEquals(
        left = step_lambda_create_event_notification.properties.Outputs['statusCode'],
        right = 200
    )
    
    step_cond_create_event_notification = ConditionStep(
        name ="CreateEventNotificationCondition",
        conditions = [cond_eq_create_event_notification],
        if_steps = [step_lambda_add_permission, step_cond_add_permission],
        else_steps = [step_fail_create_event_notification]
    )

    pipeline_name = 'batch-transform-pipeline-{0}'.format(datetime.today().strftime('%Y-%m-%d-%H-%M-%S'))

    pipeline = Pipeline(
        name = pipeline_name,
        steps = [step_lambda_create_event_notification, step_cond_create_event_notification]
    )

    print(pipeline.definition())
    pipeline.upsert(role_arn = role_arn)

    response = pipeline.start()

    print(response)
