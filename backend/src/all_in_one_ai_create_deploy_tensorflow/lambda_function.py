from sagemaker.tensorflow import TensorFlowModel
import traceback
from utils import persist_meta

def lambda_handler(event, context):
    print(event)
    
    try:
        pipeline_id = event['body']['pipeline_id'] if('pipeline_id' in event['body']) else None
        model_name = event['body']['model_name'] if('model_name' in event['body'] and event['body']['model_name'] != '') else None
        endpoint_name = event['body']['endpoint_name'] if('endpoint_name' in event['body'] and event['body']['endpoint_name'] != '') else None
        industrial_model = event['body']['industrial_model']
        model_data = event['body']['model_data']
        model_environment = event['body']['model_environment']
        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        role = event['body']['role']
        framework_version = event['body']['framework_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']

        model = TensorFlowModel(
            name = model_name,
            model_data = model_data,
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            framework_version = framework_version, 
            env = model_environment
        )
    
        predictor = model.deploy(
            endpoint_name = endpoint_name,
            instance_type = instance_type, 
            initial_instance_count = instance_count,
            wait = False
        )
        
        persist_meta(model.name, model.endpoint_name, industrial_model, pipeline_id)
        
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