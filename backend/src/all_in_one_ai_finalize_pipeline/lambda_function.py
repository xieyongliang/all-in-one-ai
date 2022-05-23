import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
import traceback

ssmh = helper.ssm_helper()
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
ddbh_pipeline = helper.ddb_helper({'table_name': pipeline_table})
ddbh_training_job = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    
    try:
        payload = json.loads(event['body'])
        industrial_model = payload['industrial_model']
        pipeline_type = payload['pipeline_type']
        pipeline_id = payload['pipeline_id']
        script_mode = payload['script_mode']
        model_data_url = payload['model_data_url']

        items = ddbh_pipeline.scan(FilterExpression=Key('pipeline_id').eq(pipeline_id))
        pipeline_execution_arn = items[0]['pipeline_execution_arn']

        if(script_mode):
            strs = model_data_url.split('/')
            training_job_name = strs[len(strs) - 3]
   
            params = {}
            params['training_job_name'] = training_job_name
            params['industrial_model'] = industrial_model
            ddbh_training_job.put_item(params)

            key = {
                'pipeline_execution_arn': pipeline_execution_arn,
                'industrial_model': industrial_model
            }
            params = {}
            params['training_job_name'] = training_job_name                    
            ddbh_pipeline.update_item(key, params)

            return {
                'statusCode': 200,
                'body': pipeline_execution_arn
            }    
        else:
            if(pipeline_type == '0' or pipeline_type == '2'):
                component_version_arn = payload['component_version_arn']
                deployment_id = payload['deployment_id']
            
            if(pipeline_type == '0' or pipeline_type == '1'):
                strs = model_data_url.split('/')
                training_job_name = strs[len(strs) - 3]
                params = {}
                params['training_job_name'] = training_job_name
                params['industrial_model'] = industrial_model
                ddbh_training_job.put_item(params)

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
                ddbh_pipeline.update_item(key, params)
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