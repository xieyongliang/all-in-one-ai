import helper
import traceback
from boto3.dynamodb.conditions import Key

ssmh = helper.ssm_helper()
model_table = ssmh.get_parameter('/all_in_one_ai/config/meta/model_table')
endpoint_table = ssmh.get_parameter('/all_in_one_ai/config/meta/endpoint_table')
pipeline_table = ssmh.get_parameter('/all_in_one_ai/config/meta/pipeline_table')
ddbh_model = helper.ddb_helper({'table_name': model_table})
ddbh_endpoint = helper.ddb_helper({'table_name': endpoint_table})
ddbh_pipeline = helper.ddb_helper({'table_name': pipeline_table})

def persist_deploy_meta(model_name, endpoint_name, industrial_model, pipeline_id):
    try:
        params = {}
        params['model_name'] = model_name
        params['industrial_model'] = industrial_model
        ddbh_model.put_item(params)
        params = {}
        params['endpoint_name'] = endpoint_name
        params['industrial_model'] = industrial_model
        ddbh_endpoint.put_item(params)

        if(pipeline_id != None):
            items = ddbh_pipeline.scan(FilterExpression=Key('pipeline_id').eq(pipeline_id))
            pipeline_execution_arn = items[0]['pipeline_execution_arn']
            params = {}
            params['model_name'] = model_name
            params['endpoint_name'] = endpoint_name
            key = {
                'pipeline_execution_arn': pipeline_execution_arn,
                'industrial_model': industrial_model
            }
            ddbh_pipeline.update_item(key, params)
    except Exception as e:
        traceback.print_exc()