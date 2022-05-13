from sagemaker.mxnet.model import MXNetModel
from sagemaker.serializers import IdentitySerializer
from sagemaker.deserializers import JSONDeserializer
import traceback

def lambda_handler(event, context):
    try:
        entry_point = event['body']['entry_point']
        source_dir = event['body']['source_dir']
        role = event['body']['role']
        framework_version = event['body']['framework_version']
        py_version = event['body']['py_version']
        instance_type = event['body']['instance_type']
        instance_count = event['body']['instance_count']

        model = MXNetModel(
            entry_point = entry_point,
            source_dir = source_dir,
            role = role,
            framework_version = framework_version, 
            py_version = py_version
        )
    
        predictor = model.deploy(
            instance_type = instance_type, 
            initial_instance_count = instance_count,
            serializer=IdentitySerializer(),
            deserializer=JSONDeserializer(),
        )

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