import os
import json
from diffusers import StableDiffusionPipeline
from diffusers import StableDiffusionImg2ImgPipeline
import boto3
import sagemaker
import uuid
import torch
from torch import autocast
from PIL import Image
import io
import requests
import traceback

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
    print('model_name: ', model_name)
    print('model_args: ', model_args)
 
    task = os.environ['task'] if('task' in os.environ) else "text-to-image"
    print('task:', task)

    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True

    if(task == 'text-to-image'):
        if(model_args != None):
            model = StableDiffusionPipeline.from_pretrained(model_name, **model_args)
        else:
            model = StableDiffusionPipeline.from_pretrained(model_name)
    else:
        if(model_args != None):
            model = StableDiffusionImg2ImgPipeline.from_pretrained(model_name, **model_args)
        else:
            model = StableDiffusionImg2ImgPipeline.from_pretrained(model_name)

    model = model.to("cuda")
    model.enable_attention_slicing()

    return model

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    input_data = json.loads(request_body)
    input_data = input_data['inputs']
    
    return input_data

def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    print('input_data: ', input_data)
    
    try:
        sagemaker_session = sagemaker.Session()
        bucket = sagemaker_session.default_bucket()
        default_output_s3uri = 's3://{0}/{1}/asyncinvoke/images/'.format(bucket, 'stablediffusion')
        output_s3uri = input_data['output_s3uri'] if 'output_s3uri' in input_data else default_output_s3uri
        infer_args = input_data['infer_args'] if ('infer_args' in input_data) else None
        print('infer_args: ', infer_args)
        init_image = infer_args['init_image'] if infer_args != None and 'init_image' in infer_args else None
        print('init_image: ', init_image )
        if(init_image != None):
            response = requests.get(init_image)
            init_img = Image.open(io.BytesIO(response.content)).convert("RGB")
            init_img_width = infer_args['init_img_width'] if 'init_img_width' in infer_args else 768
            init_img_height = infer_args['init_img_height'] if 'init_img_height' in infer_args else 512
            init_img = init_img.resize((init_img_width, init_img_height))
            manual_seed = infer_args['manual_seed'] if 'manual_seed' in infer_args else 1024
            generator = torch.Generator(device = 'cuda').manual_seed(manual_seed)
            infer_args.pop('init_image')
            if('init_img_width' in infer_args):
                infer_args.pop('init_img_width')
            if('init_img_height' in infer_args):
                infer_args.pop('init_img_height')   
            if('manual_seed' in infer_args):
                infer_args.pop('manual_seed')
        if(infer_args != None and len(infer_args.keys()) == 0):
            infer_args = None

        repetitions = os.environ['repetitions'] if('repetitions' in os.environ) else 6
        print('repetitions: ', repetitions)
        prediction = []

        with autocast("cuda"):
            for r in range(repetitions):
                if(init_image == None):
                    if(infer_args == None):
                         image = model(input_data['prompt']).images[0]
                    else:
                        image = model(input_data['prompt'], **infer_args).images[0]
                else:
                    if(infer_args == None):
                        image = model(input_data['prompt'], init_image = init_img, generator = generator).images[0]    
                    else:
                        image = model(input_data['prompt'], init_image = init_img, generator = generator, **infer_args).images[0]
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
        traceback.print_exc()
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