from sagemaker.huggingface import HuggingFace
import traceback

def lambda_handler(event, context):
    try:
        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        role = event['body']['role']
        hyperparameters = event['body']['hyperparameters']
        py_version = event['body']['py_version']
        framework_version = event['body']['framework_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        inputs = event['body']['inputs']
        transformers_version = event['body']['transformers_version'],

        estimator = HuggingFace(
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            hyperparameters = hyperparameters,
            py_version = py_version,
            framework_version = framework_version, 
            transformers_version = transformers_version,
            instance_count = instance_count,  
            instance_type = instance_type
        )
        estimator.fit(inputs)
    
    except Exception as e:
        traceback.print_exc()