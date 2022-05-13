from sagemaker.mxnet import MXNet
import traceback

def lambda_handler(event, context):
    try:
        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        role = event['body']['role']
        hyperparameters = event['body']['hyperparameters']
        framework_version = event['body']['framework_version']
        py_version = event['body']['py_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        inputs = event['body']['inputs']

        estimator = MXNet(
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            hyperparameters = hyperparameters,
            framework_version = framework_version, 
            py_version = py_version,
            instance_type = instance_type,
            instance_count = instance_count
        )
        estimator.fit(inputs)
    
    except Exception as e:
        traceback.print_exc()