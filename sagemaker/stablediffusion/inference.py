import os
import json
from diffusers import StableDiffusionPipeline
import boto3
import sagemaker
import uuid
import torch
from torch import autocast
import io

s3_client = boto3.client('s3')

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key

def model_fn(model_dir):
    """
    Load the model for inference
    """
    
    model_name = os.environ['model_name']
    model_args = json.loads(os.environ['model_args']) if ('model_args' in os.environ) else None
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

    return model

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    input_data = json.loads(request_body)

    return input_data

def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

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
                image = model(input_data['inputs']).images[0]        
                bucket, key = get_bucket_and_key(output_s3uri)
                key = '{0}{1}.jpg'.format(key, uuid.uuid4())
                buf = io.BytesIO()
                image.save(buf, format='JPEG')
                s3_client.put_object(
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
    return prediction

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """

    return json.dumps(
        {
            'result': prediction
        }
    )
