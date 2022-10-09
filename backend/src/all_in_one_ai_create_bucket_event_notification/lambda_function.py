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
        )
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


def lambda_handler(event, context):
    print(f"Event received : {event}")

    source_data_s3_bucket_and_prefix_src = event['queryStringParameters']['source_data_s3_bucket_and_prefix']
    industrial_model = event['queryStringParameters']['industrial_model']

    # Insert/Update SSM
    try:
        set_source_data_s3_bucket_for_transform_job(source_data_s3_bucket_and_prefix_src)
    except Exception as e0:
        print(f'Unable to save source_data_s3_bucket_and_prefix[{source_data_s3_bucket_and_prefix_src}] to SSM.')
        print(e0)

    # source_data_s3_bucket_and_prefix = the DESTINATION LOCAL where TRANSFORM job saves output to, map to "targetS3BucketAndPrefix" from FrontEnd
    source_data_s3_bucket_and_prefix = source_data_s3_bucket_and_prefix_src.split("/")
    source_data_s3_bucket = source_data_s3_bucket_and_prefix[0]
    source_data_s3_prefix = "" if len(source_data_s3_bucket_and_prefix) == 1 else "/".join(
        source_data_s3_bucket_and_prefix[1:])

    print(f"{source_data_s3_bucket}")
    print(f"{source_data_s3_prefix}")

    # Add ENV when provisioning lambda function
    handler_lambda_function_arn = os.environ['HANDLER_LAMBDA_FUNCTION_ARN']

    # Get function NAME with function arn
    handler_lambda_function_name = handler_lambda_function_arn.split(":")[-1]

    print(f"handler_lambda_function_arn: {handler_lambda_function_arn}")

    expect_bucket_owner = sts_client.get_caller_identity().get('Account')

    try:
        lambda_client.update_function_configuration(
            FunctionName=handler_lambda_function_name,
            Environment={
                'Variables': {
                    'ES_INDEX': industrial_model
                }
            }
        )
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
        SourceArn=f'arn:aws:s3:::{source_data_s3_bucket}',
        StatementId=STATEMENT_ID,
    )

    print(f"Response of Adding permission - {response}")

    try:
        response = create_replace_bucket_notification(STATEMENT_ID,
                                                      source_data_s3_bucket,
                                                      handler_lambda_function_arn,
                                                      source_data_s3_prefix,
                                                      expect_bucket_owner)

        print(response)
        print(f"Bucket Notification for prefix [{source_data_s3_prefix}] created.")

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
