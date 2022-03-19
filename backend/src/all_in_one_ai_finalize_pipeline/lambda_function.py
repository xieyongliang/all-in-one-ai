import json
import boto3
import helper
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key

ssmh = helper.ssm_helper()
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')

ddbhPipeline = helper.ddb_helper({'table_name': pipeline_table})

ddbhTrainingJob = helper.ddb_helper({'table_name': training_job_table})

lambda_client = boto3.client('lambda')

def lambda_handler(event, context):
    print(event)
    payload = json.loads(event['body'])
    case_name = payload['case_name']
    pipeline_type = payload['pipeline_type']
    pipeline_id = payload['pipeline_id']
    
    payload['component_version_arn'] = payload['component_version_arn'][1: len(payload['component_version_arn']) - 1]
    payload['deployment_id'] = payload['deployment_id'][1: len(payload['deployment_id'])]
    
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
            
            try:
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
                params['case_name'] = case_name
                ddbhTrainingJob.put_item(params)
                
            except Exception as e:
                print(2)
                return {
                    'statusCode': 400,
                    'body': str(e)
                }
        else: 
            print(1)
            return {
                'statusCode': 400,
                'body': response['FunctionError']
            }
        
        
    try:
        items = ddbhPipeline.scan(FilterExpression=Attr('pipeline_id').eq(pipeline_id))
        params = items[0]
        params.update(payload)
        pipeline_execution_arn = params.pop('pipeline_execution_arn')
        case_name = params.pop('case_name')
        
        key = {
            'pipeline_execution_arn': pipeline_execution_arn,
            'case_name': case_name
        }
        ddbhPipeline.update_item(key, params)
    except Exception as e:
        print(3)
        return {
            'statusCode': 400,
            'body': str(e)
        }

    print(4)
    return {
        'statusCode': 200,
        'body': payload
    }
