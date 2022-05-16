import os
import sys
from importlib_metadata import entry_points
if not os.path.exists('/tmp/package'):
    os.mkdir('/tmp/package')
os.system('pip3 install -U sagemaker -t /tmp/package')
sys.path.append('/tmp/package')
from sagemaker.huggingface.model import HuggingFaceModel
import traceback
from utils import persist_meta

def lambda_handler(event, context):
    print(event)
        
    try:
        endpoint_name = event['body']['endpoint_name'] if('endpoint_name' in event['body'] and event['body']['endpoint_name'] != '') else None
        industrial_model = event['body']['industrial_model']
        model_data = event['body']['model_data']
        hf_model_id = event['body']['hf_model_id']
        hf_task = event['body']['hf_task']
        entry_point = event['body']['entry_point'] if('entry_point' in event['body']) else None
        role = event['body']['role']
        transformers_version = event['body']['transformers_version']
        pytorch_version = event['body']['pytorch_version'] if ('pytorch_version' in event['body']) else None
        tensorflow_version = event['body']['tensorflow_version'] if('tensorflow_version' in event['body']) else None
        py_version = event['body']['py_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']

        hub = {
	        'HF_MODEL_ID': hf_model_id,
	        'HF_TASK': hf_task
        }

        model = HuggingFaceModel(
	        role = role,
            model_data = model_data,
            entry_point = entry_point,
            transformers_version = transformers_version,
            tensorflow_version = tensorflow_version,
	        pytorch_version = pytorch_version,
	        py_version = py_version,
	        env=hub
        )
    
        predictor = model.deploy(
            endpoint_name = endpoint_name,
            instance_type = instance_type, 
            initial_instance_count = instance_count,
            wait = False
        )

        persist_meta(model.name, model.endpoint_name, industrial_model)
        
        return {
            'statusCode': 200,
            'body': {
                'model_name': model.name,
                'endpoint_name': predictor.endpoint_name
            }
        }

    except Exception as e:
        traceback.print_exc()

        return {
            'statusCode': 400,
            'body': str(e)
        }