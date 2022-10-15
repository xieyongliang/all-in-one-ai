import boto3
import traceback

s3_client = boto3.client('s3')
sts_client = boto3.client('sts')
source_account = sts_client.get_caller_identity().get('Account')

def lambda_handler(event, context):
    output_s3bucket = event['body']['output_s3bucket']
    output_s3key = event['body']['output_s3key']
    statement_id = event['body']['statement_id']
    lambda_function_arn = event['body']['lambda_function_arn']

    notification_configuration = {
        'LambdaFunctionConfigurations': [
                {
                    'Id': statement_id,
                    'LambdaFunctionArn': lambda_function_arn,
                    'Events': [
                        "s3:ObjectCreated:*",
                    ],
                    'Filter': {
                        'Key': {
                            'FilterRules': [
                                {
                                    'Name': 'prefix',
                                    'Value': output_s3key
                                },
                            ]
                        }
                    }
                },
            ],
            'EventBridgeConfiguration': {}
    }


    try:
        s3_client.put_bucket_notification_configuration(
            Bucket = output_s3bucket,
            NotificationConfiguration = notification_configuration,
            ExpectedBucketOwner = source_account,
            SkipDestinationValidation = True
        )
        return {
            'statusCode': 200,
            'body': ''
        }
    except Exception as e:
        traceback.print_exc()

        return {
            'statusCode': 400,
            'body': str(e)
        }

