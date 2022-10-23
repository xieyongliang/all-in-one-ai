import os
import json
from diffusers import StableDiffusionPipeline
import boto3
import sagemaker
import uuid
import torch
from torch import autocast
import io

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
        input_data = json.loads(data[0]['body'].decode())

        sagemaker_session = sagemaker.Session()
        bucket = sagemaker_session.default_bucket()
        default_output_s3uri = 's3://{0}/{1}/asyncinvoke/images/'.format(bucket, 'stablediffusion')
        output_s3uri = input_data['output_s3uri'] if 'output_s3uri' in input_data else default_output_s3uri

        repetitions = os.environ['repetitions'] if('repetitions' in os.environ) else 6
        print('repetitions: ', repetitions)
        prediction = []

        try:
            with autocast("cuda"):
                for r in range(repetitions):
                    image = self.model(input_data['inputs']).images[0]        
                    bucket, key = get_bucket_and_key(output_s3uri)
                    key = '{0}{1}.jpg'.format(key, uuid.uuid4())
                    buf = io.BytesIO()
                    image.save(buf, format='JPEG')
                    self.s3_client.put_object(
                        Body = buf.getvalue(), 
                        Bucket = bucket, 
                        Key = key, 
                        ContentType = 'image/jpeg'
                    )
                    print('image: ', 's3://{0}/{1}'.format(bucket, key))
                    prediction.append('s3://{0}/{1}'.format(bucket, key))
        except Exception as e:
            print(e)
        
        print('prediction: ', prediction)

        result = json.dumps(
            {
                'result': prediction
            }
        )

        return [result]

    def initialize(self, context):
        """
        Load the model for inference
        """
        model_name = os.environ['model_name']
        model_args = json.loads(os.environ['model_args'])
        print('model_name', model_name)
        print('model_args', model_args)
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        if(model_args != None):
            model = StableDiffusionPipeline.from_pretrained(model_name, **model_args)
        else:
            model = StableDiffusionPipeline.from_pretrained(model_name)
        model = model.to("cuda")
        model.enable_attention_slicing()
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