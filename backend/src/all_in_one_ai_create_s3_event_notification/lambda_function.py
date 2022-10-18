import boto3
import traceback
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')
sts_client = boto3.client('sts')
source_account = sts_client.get_caller_identity().get('Account')

import_table = 'all_in_one_ai_import_job'

def lambda_handler(event, context):
    try:
        output_s3uri = event['output_s3uri']
        output_s3bucket, output_s3key = get_bucket_and_key(output_s3uri)

        industrial_model = event['industrial_model']

        lambda_function_arn = event['lambda_function_arn']

        response = s3_client.get_bucket_notification_configuration(
            Bucket = output_s3bucket,
            ExpectedBucketOwner = source_account
        )

        notificationConfiguration = {}

        if('TopicConfigurations' in response):
            notificationConfiguration['TopicConfigurations'] = response['TopicConfigurations']

        if('QueueConfigurations' in response):
            notificationConfiguration['QueueConfigurations'] = response['QueueConfigurations']

        if('EventBridgeConfiguration' in response):
            notificationConfiguration['EventBridgeConfiguration'] = response['EventBridgeConfiguration']

        if('LambdaFunctionConfigurations' in response):
            notificationConfiguration['LambdaFunctionConfigurations'] = response['LambdaFunctionConfigurations']
            existed = False
            for lambda_function_configurations in notificationConfiguration['LambdaFunctionConfigurations']:
                if(lambda_function_configurations['Id'] == industrial_model):
                    lambda_function_configurations = {
                        'Id': industrial_model,
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
                                    }
                                ]
                            }
                        }
                    }
                    existed = True
                    break
            if not existed:    
                notificationConfiguration['LambdaFunctionConfigurations'].append(
                    {
                        'Id': industrial_model,
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
                                    }
                                ]
                            }
                        }
                    }
                )
        else:
            notificationConfiguration['LambdaFunctionConfigurations'] = [
                {
                    'Id': industrial_model,
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
                                }
                            ]
                        }
                    }
                }
            ]

        print(notificationConfiguration)
        response = s3_client.put_bucket_notification_configuration(
            Bucket = output_s3bucket,
            NotificationConfiguration = notificationConfiguration,
            ExpectedBucketOwner = source_account,
            SkipDestinationValidation = True
        )
        print(response)

        return {
            'statusCode': 200,
            'body': ''
        }
    except ClientError as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key