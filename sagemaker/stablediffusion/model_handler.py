import os
import json
from diffusers import StableDiffusionPipeline
import boto3
import sagemaker
from datetime import datetime

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key

class ModelHandler(object):
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.initialized = False
        self.model = None
    
    def transform_fn(self, data: any, context: any):
        print(data)
        print(context)
        data = json.loads(data[0]['body'].decode())
        payload = data['inputs']

        sagemaker_session = sagemaker.Session()
        bucket = sagemaker_session.default_bucket()
        default_output_s3uri = 's3://{0}/{1}/inference/output'.format(bucket, 'stylegan')
        output_s3uri = payload['output_s3uri'] if 'output_s3uri' in payload else default_output_s3uri

        image = self.model(payload).images[0]
        bucket, key = get_bucket_and_key(output_s3uri)
        data = image.tobytes("hex", "rgb")
        self.s3_client.upload_fileobj(data, bucket, key)

        result = {
            'results': output_s3uri
        }

        return [result]

    def initialize(self, context):
        """
        Load the model for inference
        """
        pretrained = os.environ['pretrained']
        print('Loading model from ', pretrained)
        model = StableDiffusionPipeline.from_pretrained("{0}/{1}".format('/opt/ml/model', pretrained))
        model.to("cuda")
        self.model = model
    
    def handle(self, data, context):
        """
        Call preprocess, inference and post-process functions
        :param data: input data
        :param context: mms context
        """

        return self.transform_fn(data, context)

_service = ModelHandler()


def handle(data, context):
    if not _service.initialized:
        _service.initialize(context)

    if data is None:
        return None

    return _service.handle(data, context)