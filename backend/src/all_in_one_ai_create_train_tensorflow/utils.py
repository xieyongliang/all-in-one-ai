import json
import helper
import traceback

ssmh = helper.ssm_helper()
training_job_table = ssmh.get_parameter('/all_in_one_ai/config/meta/training_job_table')
ddbh = helper.ddb_helper({'table_name': training_job_table})

def persist_meta(job_name, industrial_model):
    try:
        params = {}
        params['training_job_name'] = job_name
        params['industrial_model'] = industrial_model
        ddbh.put_item(params)
    except Exception as e:
        traceback.print_exc()