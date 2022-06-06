from sagemaker.huggingface import HuggingFace
import traceback
from utils import persist_meta

def lambda_handler(event, context):
    print(event)
    
    try:
        job_name = event['body']['job_name'] if('job_name' in event['body'] and event['body']['job_name'] != '') else None
        industrial_model = event['body']['industrial_model']

        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        role = event['body']['role']
        hyperparameters = event['body']['hyperparameters']
        py_version = event['body']['py_version']
        pytorch_version = event['body']['pytorch_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        inputs = event['body']['inputs']
        transformers_version = event['body']['transformers_version'],

        estimator = HuggingFace(
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            debugger_hook_config = False,
            hyperparameters = hyperparameters,
            py_version = py_version,
            transformers_version = transformers_version,
            pytorch_version = pytorch_version,
            instance_count = instance_count,  
            instance_type = instance_type
        )
        estimator.fit(inputs, job_name = job_name, wait = False)
        
        persist_meta(estimator._current_job_name, industrial_model)

        return {
            'statusCode': 200,
            'body': estimator._current_job_name
        }
    
    except Exception as e:
        traceback.print_exc()

        return {
            'statusCode': 400,
            'body': str(e)
        }        