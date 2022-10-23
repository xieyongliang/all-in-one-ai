import boto3
import traceback
import json
from botocore.exceptions import ClientError
import helper

sts_client = boto3.client('sts')
lambda_client = boto3.client('lambda')
source_account = sts_client.get_caller_identity().get('Account')
import_jobs_table = 'all_in_one_ai_import_jobs'
ddbh = helper.ddb_helper({'table_name': import_jobs_table})

def lambda_handler(event, context):
    statement_id = event['industrial_model']
    input_s3uir = event['input_s3uri']
    output_s3uri = event['output_s3uri']
    function_name = event['lambda_function_arn']

    output_s3bucket, _ = get_bucket_and_key(output_s3uri)

    try:
        params = {}
        params['industrial_model'] = statement_id
        params['input_s3uir'] = input_s3uir
        params['output_s3uri'] = output_s3uri
        ddbh.put_item(params)

        response = lambda_client.add_permission(
            Action='lambda:InvokeFunction',
            FunctionName = function_name,
            Principal = 's3.amazonaws.com',
            SourceAccount = source_account,
            SourceArn = f'arn:aws:s3:::{output_s3bucket}',
            StatementId = statement_id,
        )

        print(response)
    except ClientError as e:
        error = e.response["Error"]
        code = error["Code"]
        if code == "ResourceConflictException":
            response = lambda_client.remove_permission(
                FunctionName = function_name,
                StatementId = statement_id,
            )
            print(response)
            
            response = lambda_client.add_permission(
                Action='lambda:InvokeFunction',
                FunctionName = function_name,
                Principal = 's3.amazonaws.com',
                SourceAccount = source_account,
                SourceArn = f'arn:aws:s3:::{output_s3bucket}',
                StatementId = statement_id,
            )
            print(response)
            
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

        environment = {}
        
        if('Environment' in response):
            environment = response['Environment']
            if('Variables' in environment):
                variables = environment['Variables']
                if('ES_INDEX_MAP' in variables):
                    es_index_map = json.loads(variables['ES_INDEX_MAP'])
                    es_index_map[statement_id] = output_s3uri
                else:
                    es_index_map = {
                        statement_id: output_s3uri
                    }
            else:
                environment['Variables'] = {}
                es_index_map = {
                    statement_id: output_s3uri
                }
        else:
            environment['Variables'] = {}
            es_index_map = {
                statement_id: output_s3uri
            }
            
        environment['Variables']['ES_INDEX_MAP'] = json.dumps(es_index_map)
        
        print(environment)
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

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
