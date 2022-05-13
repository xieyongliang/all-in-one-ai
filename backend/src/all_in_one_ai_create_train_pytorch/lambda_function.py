from sagemaker.pytorch import PyTorch
import sagemaker
from threading import Thread
import traceback
import time

def start_train(estimator, inputs, job_name):
    estimator.fit(inputs, job_name = job_name)

import sagemaker
sagemaker_session = sagemaker.session.Session()

def lambda_handler(event, context):
    print(event)

    try:
        job_name = event['body']['job_name']
        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        git_config = event['body']['git_config']
        role = event['body']['role']
        hyperparameters = event['body']['hyperparameters']
        framework_version = event['body']['framework_version']
        py_version = event['body']['py_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']
        inputs = event['body']['inputs']

        estimator = PyTorch(
            entry_point = entry_point,
            source_dir = source_dir,
            git_config = git_config,
            role = role,
            hyperparameters = hyperparameters,
            framework_version = framework_version, 
            py_version = py_version,
            instance_type = instance_type,
            instance_count = instance_count
        )
        thread = Thread(target=start_train, args=(estimator, inputs, job_name))
        thread.start()
        
        while True:
            if(not thread.is_alive()):
                return {
                    'statusCode': '400',
                    'body': ''
                }
            if(estimator._current_job_name != None):
                try:
                    response = sagemaker_session.describe_training_job(estimator._current_job_name)
                    print(response)
                    return {
                        'statusCode': '200',
                        'body': estimator._current_job_name
                    }
                except Exception as e:
                    pass
            time.sleep(1)
            
    except Exception as e:
        traceback.print_exc()