import json
import boto3

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    function_name = None
    if event['pathParameters'] != None:
            if 'function_name' in event['pathParameters']:
                function_name = event['pathParameters']['function_name']
    
    if(function_name == None):            
        return {
            'statusCode': 400,
            'body': 'Parameter - function_name is missing'
        }
    
    action_name = None
    if event['queryStringParameters'] != None:
        if 'action' in event['queryStringParameters']:
            action_name = event['queryStringParameters']['action']

    if(action_name == 'code'):
        response = lambda_client.get_function(
            FunctionName=function_name
        )

        return {
            'statusCode': 200,
            'body': response['Code']['Location']
        }
    elif(action_name == 'console'):
        region_name = boto3.session.Session().region_name
        function_console = 'https://console.aws.amazon.com/lambda/home?region={0}#/functions/{1}?tab=code'.format(region_name, function_name)
    
        return {
            'statusCode': 200,
            'body': function_console
        }
    else:
        return {
            'statusCode': 400,
            'body': 'Parameter - action is unsupported'
        }
    
