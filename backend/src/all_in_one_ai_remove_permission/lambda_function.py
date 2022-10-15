import boto3
import traceback

sts_client = boto3.client('sts')
lambda_client = boto3.client('lambda')
source_account = sts_client.get_caller_identity().get('Account')

def lambda_handler(event, context):
    statement_id = event['body']['statement_id']
    function_name = event['body']['function_name']

    try:
        lambda_client.remove_permission(
            FunctionName = function_name,
            StatementId = statement_id,
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

