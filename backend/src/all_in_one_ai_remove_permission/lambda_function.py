import boto3
import json
import traceback
from botocore.exceptions import ClientError
import helper

sts_client = boto3.client('sts')
lambda_client = boto3.client('lambda')
source_account = sts_client.get_caller_identity().get('Account')
import_jobs_table = 'all_in_one_ai_import_jobs'
ddbh = helper.ddb_helper({'table_name': import_jobs_table})

def lambda_handler(event, context):
    statement_id = event['industrial_model']
    function_name = event['lambda_function_arn']

    try:
        key = {}
        key['industrial_model'] = statement_id
        ddbh.delete_item(key)

        response = lambda_client.remove_permission(
            FunctionName = function_name,
            StatementId = statement_id,
        )
        print(response)
    except ClientError as e:
        error = e.response["Error"]
        code = error["Code"]
        if code == "ResourceNotFoundException":
            pass
        else:
            traceback.print_exc()

            return {
                'statusCode': 400,
                'body': str(e)
            }

    try:
        response = lambda_client.get_function_configuration(
            FunctionName = function_name
        )
        print(response)
    
        if('Environment' in response):
            environment = response['Environment']
            if('Variables' in environment):
                if('ES_INDEX_MAP' in environment['Variables']):
                    es_index_map = json.loads(environment['Variables']['ES_INDEX_MAP'])
                    if(statement_id in es_index_map):
                        es_index_map.pop(statement_id)
                        if(es_index_map != {}):
                            environment['Variables']['ES_INDEX_MAP'] = json.dumps(es_index_map)
                        else:
                            environment['Variables'].pop('ES_INDEX_MAP')
                        
                        print(environment['Variables'])
                        
                        response = lambda_client.update_function_configuration(
                            FunctionName = function_name,
                            Environment = environment
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

