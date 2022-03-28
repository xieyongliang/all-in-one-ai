import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
import traceback

ssmh = helper.ssm_helper()
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')

ddbhPipeline = helper.ddb_helper({'table_name': pipeline_table})

ddbhTrainingJob = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    try:
        payload = json.loads(event['body'])
        industrial_model = payload['industrial_model']
        pipeline_execution_arn = ''
        pipeline_type = payload['pipeline_type']
        pipeline_id = payload['pipeline_id']
        
        if(pipeline_type == '0' or pipeline_type == '2'):
            component_version_arn = payload['component_version_arn'][1: len(payload['component_version_arn']) - 1]
            deployment_id = payload['deployment_id'][1: len(payload['deployment_id'])]
        
        if(pipeline_type == '0' or pipeline_type == '1'):
            request = {
                'model_name': payload['model_name']
            }
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_describe_model',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : request})
            )
            if('FunctionError' not in response):
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                payload = json.loads(payload)
                
                model_package_name = payload['Containers'][0]['ModelPackageName']
                            
                request = {
                    'model_package_arn': model_package_name
                }
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_model_package',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'queryStringParameters' : request, 'httpMethod': 'GET'})
                )
                print(response)
                payload = response["Payload"].read().decode("utf-8")
                payload = json.loads(payload)
                payload = json.loads(payload['body'])
                model_data_url = payload['InferenceSpecification']['Containers'][0]['ModelDataUrl']
                strs = model_data_url.split('/')
                training_job_name = strs[len(strs) - 3]
                    
                payload['training_job_name'] = training_job_name
            
                params = {}
                params['training_job_name'] = training_job_name
                params['industrial_model'] = industrial_model
                ddbhTrainingJob.put_item(params)
                    
            else: 
                return {
                    'statusCode': 400,
                    'body': response['FunctionError']
                }

        items = ddbhPipeline.scan(FilterExpression=Attr('pipeline_id').eq(pipeline_id))
        pipeline_execution_arn = items[0]['pipeline_execution_arn']
        params = {}
        if(pipeline_type == '0'):
            params['training_job_name'] = training_job_name
            params['component_version_arn'] = component_version_arn
            params['deployment_id'] = deployment_id
        elif(pipeline_type == '1'):
            params['training_job_name'] = training_job_name
        elif(pipeline_type == '2'):
            params['component_version_arn'] = component_version_arn
            params['deployment_id'] = deployment_id

        if(pipeline_type == '0' or pipeline_type == '1' or pipeline_type == '2'):

            key = {
                'pipeline_execution_arn': pipeline_execution_arn,
                'industrial_model': industrial_model
            }
            ddbhPipeline.update_item(key, params)
    
        return {
            'statusCode': 200,
            'body': pipeline_execution_arn
        }

    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }