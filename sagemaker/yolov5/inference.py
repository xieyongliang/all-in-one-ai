import os
import io
import torch
import json
import boto3
from PIL import Image

s3_client = boto3.client('s3')

def model_fn(model_dir):
    """
    Load the model for inference
    """

    model_name = os.environ['model_name'] if('model_name' in os.environ) else 'custom'
    if(model_name == 'custom'):
        model = torch.hub.load('ultralytics/yolov5', 'custom', os.path.join(model_dir, 'tutorial', 'weights', 'best.pt'), force_reload=True)
    else:
        model = torch.hub.load('ultralytics/yolov5', model_name, force_reload=True)
    print(model)
    return model

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'image/jpg' or request_content_type == 'image/jpeg' or request_content_type == 'image/png':
        bytes = request_body
        return Image.open(io.BytesIO(bytes))
    elif request_content_type == 'application/json':
        data = request_body.decode('utf-8')
        data = json.loads(data)
        bucket = data['bucket']
        image_uri = data['image_uri']
        s3_object = s3_client.get_object(Bucket = bucket, Key = image_uri) 
        bytes = s3_object["Body"].read()
        return Image.open(io.BytesIO(bytes))
    else:
        return request_body

    
def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    size = os.environ['size'] if('size' in os.environ) else 415
    pred = model(input_data, size=size)
    result = json.loads(pred.pandas().xyxy[0].to_json(orient="records"))
    output = []
    for item in result:
        width = item['xmax'] - item['xmin']
        height = item['ymax'] - item['ymin']
        x0 = item['xmin'] + width / 2.0
        y0 = item['ymin'] + height / 2.0
        output.append('{0} {1} {2} {3} {4}'.format(item['class'], x0 / input_data.size[0], y0 / input_data.size[1], width / input_data.size[0], height / input_data.size[1]))
    return output

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """

    return json.dumps(prediction)
