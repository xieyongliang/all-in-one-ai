import json
import os
import boto3
import mxnet as mx
from mxnet.gluon import nn
from gluoncv.model_zoo import get_model
from gluoncv.data.transforms.presets.imagenet import transform_eval

s3_client = boto3.client('s3')

def get_embedding_advance(input_pic, seq_net, use_layer):
    img = input_pic
    
    ctx = [mx.cpu()]
    img = transform_eval(img).copyto(ctx[0])
    pred = None
    for i in range(len(seq_net)):
        img = seq_net[i](img)
        if i == use_layer:
            pred = img[0]
            break

    return pred.asnumpy()

def model_fn(model_dir):
    """
    Load the model for inference
    """
    
    classes = os.environ['classes'] if ('classes' in os.environ) else 10
    model_name = os.environ['model_name'] if('model_name' in os.environ) else 'ResNet50_v2'

    num_gpus = os.environ['num_gpus'] if ('num_gpus' in os.environ) else 0
    ctx = [mx.gpu(i) for i in range(num_gpus)] if num_gpus > 0 else [mx.cpu()]
    saved_params = os.path.join(model_dir, 'model-0000.params')
    if not os.path.exists(saved_params):
        saved_params = ''
    pretrained = True if saved_params == '' else False

    if not pretrained:
        net = get_model(model_name, classes=classes, pretrained=pretrained)
        net.load_parameters(saved_params)
    else:
        net = get_model(model_name, pretrained=pretrained)

    net.collect_params().reset_ctx(ctx)

    seq_net = nn.Sequential()
    for i in range(len(net.features)):
        seq_net.add(net.features[i])

    return seq_net

def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    pred = get_embedding_advance(input_data, model, use_layer=len(model) - 1)
    result = pred.tolist()
    return json.dumps({'predictions': [result]})

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'image/jpg' or request_content_type == 'image/jpeg' or request_content_type == 'image/png':
        bytes = request_body
        return mx.image.imdecode(request_body)
    elif request_content_type == 'application/json':
        data = request_body.decode('utf-8')
        data = json.loads(data)
        bucket = data['bucket']
        image_uri = data['image_uri']
        s3_object = s3_client.get_object(Bucket = bucket, Key = image_uri) 
        bytes = s3_object["Body"].read()
        return mx.image.imdecode(bytes)
    else:
        return request_body

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """
    
    return prediction