import boto3

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    function_name = event['body']['function_name']
    response = lambda_client.get_function(
        FunctionName=function_name
    )
    
    return response['Code']['Location']
