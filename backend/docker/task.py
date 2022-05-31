# -*- coding: utf-8 -*-

import os
import json
from sagemaker.pytorch.model import PyTorchModel
import traceback
from utils import persist_deploy_meta

import sys
try:
    sys.setdefaultencoding('utf-8')
except:
    pass

from datetime import datetime

parameters = json.loads(os.getenv('parameters'))
pipeline_id = parameters['pipeline_id']
model_name = parameters['model_name"']
endpoint_name = parameters['"endpoint_name']
industrial_model = parameters['industrial_model']
model_data = parameters['model_data"']
model_environment = parameters['model_environment']
entry_point = parameters['entry_point']
source_dir = parameters['source_dir"']
role = parameters['role']
framework_version = parameters['framework_version']
py_version = parameters['py_version']
instance_type = parameters['instance_type']
instance_count = parameters['instance_count']

# Hack to print to stderr so it appears in CloudWatch.
def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

def main():
    try:
        model = PyTorchModel(
            name = model_name,
            model_data = model_data,
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            framework_version = framework_version, 
            py_version = py_version,
            env = model_environment
        )
    
        predictor = model.deploy(
            endpoint_name = endpoint_name,
            instance_type = instance_type, 
            initial_instance_count = instance_count,
            wait = False
        )
        
        persist_deploy_meta(model.name, model.endpoint_name, industrial_model, pipeline_id)
        
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


if __name__ == "__main__":
    eprint(">>> Start execution.")
    main()
    eprint("<<< Exit.")
    exit(0)
