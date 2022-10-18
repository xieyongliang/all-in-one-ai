import boto3
import traceback

s3_client = boto3.client('s3')
sts_client = boto3.client('sts')
source_account = sts_client.get_caller_identity().get('Account')

def lambda_handler(event, context):
    try:
        output_s3uri = event['output_s3uri']
        output_s3bucket, _ = get_bucket_and_key(output_s3uri)
        
        statement_id = event['industrial_model']

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
            for i in range(len(notificationConfiguration['LambdaFunctionConfigurations'])):
                if notificationConfiguration['LambdaFunctionConfigurations'][i]['Id'] == statement_id:
                    del notificationConfiguration['LambdaFunctionConfigurations'][i]
                    break
    
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
    except Exception as e:
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