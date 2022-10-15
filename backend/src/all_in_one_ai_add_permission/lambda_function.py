import boto3
import traceback

sts_client = boto3.client('sts')
lambda_client = boto3.client('lambda')
source_account = sts_client.get_caller_identity().get('Account')

def lambda_handler(event, context):
    statement_id = event['body']['statement_id']
    output_s3bucket = event['body']['output_s3bucket']
    function_name = event['body']['function_name']

    try:
        response = lambda_client.add_permission(
            Action='lambda:InvokeFunction',
            FunctionName = function_name,
            Principal = 's3.amazonaws.com',
            SourceAccount = source_account,
            SourceArn = f'arn:aws:s3:::{output_s3bucket}',
            StatementId = statement_id,
        )

        return {
            'statusCode': 200,
            'body': response['Statement']
        }
    except Exception as e:
        traceback.print_exc()

        return {
            'statusCode': 400,
            'body': str(e)
        }

