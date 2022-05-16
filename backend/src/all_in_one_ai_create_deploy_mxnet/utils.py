import json
import helper
import traceback

ssmh = helper.ssm_helper()
model_table = ssmh.get_parameter('/all_in_one_ai/config/meta/model_table')
endpoint_table = ssmh.get_parameter('/all_in_one_ai/config/meta/endpoint_table')
ddbh_model = helper.ddb_helper({'table_name': model_table})
ddbh_endpoint = helper.ddb_helper({'table_name': endpoint_table})

def persist_meta(model_name, endpoint_name, industrial_model):
    try:
        params = {}
        params['model_name'] = model_name
        params['industrial_model'] = industrial_model
        ddbh_model.put_item(params)
        params = {}
        params['endpoint_name'] = endpoint_name
        params['industrial_model'] = industrial_model
        ddbh_endpoint.put_item(params)    
    except Exception as e:
        traceback.print_exc()