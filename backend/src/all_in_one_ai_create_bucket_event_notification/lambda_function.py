import uuid
import json
import boto3
import os
import traceback

lambda_client = boto3.client('lambda')
s3 = boto3.client('s3')
session = boto3.session.Session()
sts_client = boto3.client('sts')
S3_OBJECT_EVENT = "s3:ObjectCreated:*"
STATEMENT_ID = "s3-lambda-permission-statement"
s3_client = boto3.resource('s3')


def create_replace_bucket_notification(notification_id, source_data_s3_bucket, handler_lambda_function_arn,
                                       source_data_s3_prefix,
                                       expect_bucket_owner):
    """
       Create lambda bucket notification configuration
    """

    if source_data_s3_prefix == "":
        notification_configuration = {
            'LambdaFunctionConfigurations': [
                {
                    'Id': notification_id,
                    'LambdaFunctionArn': handler_lambda_function_arn,
                    'Events': [
                        S3_OBJECT_EVENT,
                    ],
                },
            ],
            'EventBridgeConfiguration': {}
        }
    else:
        notification_configuration = {
            'LambdaFunctionConfigurations': [
                {
                    'Id': notification_id,
                    'LambdaFunctionArn': handler_lambda_function_arn,
                    'Events': [
                        S3_OBJECT_EVENT,
                    ],
                    'Filter': {
                        'Key': {
                            'FilterRules': [
                                {
                                    'Name': 'prefix',
                                    'Value': source_data_s3_prefix
                                },
                            ]
                        }
                    }
                },
            ],
            'EventBridgeConfiguration': {}
        }

    return s3.put_bucket_notification_configuration(
        Bucket=source_data_s3_bucket,
        NotificationConfiguration=notification_configuration,
        ExpectedBucketOwner=expect_bucket_owner,
        SkipDestinationValidation=True
    )


def set_source_data_s3_bucket_for_transform_job(uri, action=None):
    ssm_client = boto3.client('ssm')

    _param_name = "/all_in_one_ai/config/meta/source_data_s3_bucket_for_transform_job"

    if action:
        return ssm_client.get_parameter(
            Name=_param_name,
        )['Parameter']['Value']
    else:
        # Update or Create parameter
        try:
            # update
            ssm_client.put_parameter(
                Name=_param_name,
                Value=uri,
                Type='String',
                Overwrite=True
            )
        except Exception as ee:
            print(f"Error occurred. {ee}")


def get_s3_bucket_file_count(target_s3_bucket_and_prefix):
    """
        Reason for not using "s3.list_object_v2" is the api
        only returns 1000 objects.
    """

    print(f"bucket_name_and_prefix : {target_s3_bucket_and_prefix}")

    if target_s3_bucket_and_prefix.find(":") != -1:  # With scheme S3://
        target_s3_bucket_and_prefix = target_s3_bucket_and_prefix[5:]

    if target_s3_bucket_and_prefix.find("/") == -1:  # without Prefix
        bucket = target_s3_bucket_and_prefix
        prefix = ""
    else:
        _l = target_s3_bucket_and_prefix.split("/")
        bucket = _l[0]
        prefix = "/".join(_l[1:])

    # get the bucket
    bucket = s3_client.Bucket(bucket)

    count_obj = sum(1 for _ in bucket.objects.filter(Prefix=prefix))
    print(f"Total count of Target Bucket/Prefix : {count_obj}")

    return count_obj


def get_source_data_s3_bucket_for_transform_job():
    ssm_client = boto3.client('ssm')

    _param_name = "/all_in_one_ai/config/meta/source_data_s3_bucket_for_transform_job"

    try:
        return ssm_client.get_parameter(
            Name=_param_name,
        )['Parameter']['Value']
    except Exception as ee:
        print(f"Error occurred. {ee}")
        return ""


def set_or_get_source_file_count_for_transform_job(current_file_count, action=None):
    ssm_client = boto3.client('ssm')

    _param_name = "/all_in_one_ai/config/meta/source_file_count_for_transform_job"

    if action:
        return ssm_client.get_parameter(
            Name=_param_name,
        )['Parameter']['Value']
    else:
        # Update or Create parameter
        try:
            # update
            ssm_client.put_parameter(
                Name=_param_name,
                Value=str(current_file_count),
                Type='String',
                Overwrite=True
            )
        except Exception as ee:
            print(f"Error occurred. {ee}")


def lambda_handler(event, context):
    print(f"Event received : {event}")

    source_data_s3_bucket_and_prefix_src = event['queryStringParameters']['source_data_s3_bucket_and_prefix']
    event_notification_s3_bucket_and_prefix_src = event['queryStringParameters'][
        'event_notification_s3_bucket_and_prefix']
    event_notification_s3_bucket_and_prefix_src = event_notification_s3_bucket_and_prefix_src[5:]
    industrial_model = event['queryStringParameters']['industrial_model']

    # Insert/Update SSM
    try:
        set_source_data_s3_bucket_for_transform_job(source_data_s3_bucket_and_prefix_src)
    except Exception as e0:
        print(f'Unable to save source_data_s3_bucket_and_prefix[{source_data_s3_bucket_and_prefix_src}] to SSM.')
        print(e0)

    # source_data_s3_bucket_and_prefix = the DESTINATION LOCAL where TRANSFORM job saves output to, map to "targetS3BucketAndPrefix" from FrontEnd
    event_notification_s3_bucket_and_prefix = event_notification_s3_bucket_and_prefix_src.split("/")
    event_notification_s3_bucket = event_notification_s3_bucket_and_prefix[0]
    event_notification_s3_prefix = "" if len(event_notification_s3_bucket_and_prefix) == 1 else "/".join(
        event_notification_s3_bucket_and_prefix[1:])

    print(f"{event_notification_s3_bucket}")
    print(f"{event_notification_s3_prefix}")

    # Add ENV when provisioning lambda function
    handler_lambda_function_arn = os.environ['HANDLER_LAMBDA_FUNCTION_ARN']

    # Get function NAME with function arn
    handler_lambda_function_name = handler_lambda_function_arn.split(":")[-1]

    print(f"handler_lambda_function_arn: {handler_lambda_function_arn}")

    expect_bucket_owner = sts_client.get_caller_identity().get('Account')

    try:
        _new_var = {'ES_INDEX': industrial_model}

        existing_env_config = lambda_client.get_function_configuration(FunctionName=handler_lambda_function_arn)['Environment']['Variables']

        response = lambda_client.update_function_configuration(
            FunctionName=handler_lambda_function_arn,
            Environment={
                'Variables': {**existing_env_config, **_new_var}
            }
        )
        print(response)
        print(f"Successfully set ES_INDEX to {industrial_model}")
    except Exception as ee0:
        pass
        print(f"Unable to set ES_INDEX to {industrial_model}")

    try:
        # Remove if exists
        lambda_client.remove_permission(
            FunctionName=handler_lambda_function_name,
            StatementId=STATEMENT_ID,
        )
    except Exception as e0:
        pass

    response = lambda_client.add_permission(
        Action='lambda:InvokeFunction',
        FunctionName=handler_lambda_function_name,
        Principal='s3.amazonaws.com',
        SourceAccount=expect_bucket_owner,
        SourceArn=f'arn:aws:s3:::{event_notification_s3_bucket}',
        StatementId=STATEMENT_ID,
    )

    print(f"Response of Adding permission - {response}")

    # Update FILE_COUNT of SOURCE_DIR to SSM
    source_data_path = get_source_data_s3_bucket_for_transform_job()
    print(f"source_data_path: {source_data_path}")

    total_file_count = get_s3_bucket_file_count(source_data_path)
    print(f"Total File Count is {total_file_count}")

    # # Insert to SSM
    set_or_get_source_file_count_for_transform_job(total_file_count)

    try:
        response = create_replace_bucket_notification(STATEMENT_ID,
                                                      event_notification_s3_bucket,
                                                      handler_lambda_function_arn,
                                                      event_notification_s3_prefix,
                                                      expect_bucket_owner)

        print(response)
        print(f"Bucket Notification for prefix [{event_notification_s3_prefix}] created.")

        return {
            "isBase64Encoded": True,
            "statusCode": 200,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps(response)
        }

    except Exception as ee:
        traceback.print_exc()
        return {
            "isBase64Encoded": True,
            "statusCode": 400,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({
                "Error": str(ee)
            })
        }
