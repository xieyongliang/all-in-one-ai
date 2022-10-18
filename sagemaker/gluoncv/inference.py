import json
import os
import boto3
import mxnet as mx
from mxnet.gluon import nn
from gluoncv.model_zoo import get_model
from gluoncv.data.transforms.presets.imagenet import transform_eval
from mxnet import nd

s3_client = boto3.client('s3')

def transform_fn(model: any, request_body: any, content_type: any, accept_type: any):
    print('[DEBUG] request_body:', type(request_body))
    print('[DEBUG] content_type:', content_type)
    print('[DEBUG] accept_type:', accept_type)

    if content_type == 'image/jpg' or content_type == 'image/jpeg' or content_type == 'image/png':
        bytes = request_body
        input_data = mx.image.imdecode(request_body)
    elif content_type == 'application/json':
        data = json.loads(request_body)
        bucket = data['bucket']
        image_uri = data['image_uri']
        s3_object = s3_client.get_object(Bucket = bucket, Key = image_uri) 
        bytes = s3_object["Body"].read()
        input_data = mx.image.imdecode(bytes)
    else:
        input_data = request_body

    task = os.environ['task'] if('task' in os.environ) else 'search'
    pred = predict(input_data, model, task)
    result = pred.tolist()

    return json.dumps({'result': result})

def predict(input_pic, net, task):
    img = input_pic        
    ctx = [mx.gpu(i) for i in range(mx.context.num_gpus())] if mx.context.num_gpus() else [mx.cpu()]
    img = transform_eval(img).copyto(ctx[0])
    
    if(task == 'search'):
        seq_net = nn.Sequential()
        for i in range(len(net.features)):
            seq_net.add(net.features[i])

        use_layer = len(seq_net) - 1
        pred = None
        for i in range(len(seq_net)):
            img = seq_net[i](img)
            if i == use_layer:
                pred = img[0]
                break

        return pred.asnumpy()
    else:
        top_k = int(os.environ['top_k']) if ('top_k' in os.environ) else 5
        pred = net(img)
        prob = mx.nd.softmax(pred)[0].asnumpy()
        ind = mx.nd.topk(pred, k = top_k)[0].astype('int')

        return ind.asnumpy()

def model_fn(model_dir):
    """
    Load the model for inference
    """
    
    classes = int(os.environ['classes']) if ('classes' in os.environ) else 1000
    model_name = os.environ['model_name'] if('model_name' in os.environ) else 'ResNet50_v2'

    ctx = [mx.gpu(i) for i in range(mx.context.num_gpus())] if mx.context.num_gpus() else [mx.cpu()]
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

    return net

