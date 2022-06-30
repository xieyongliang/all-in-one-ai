print('0')
import io
print('1')
import os
print('2')
import json
print('3')
import boto3
print('4')
import numpy as np
print('5')
from PIL import Image
print('6')
from numpy import asarray
print('7')

s3_client = boto3.client('s3')

class MyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return super(MyEncoder, self).default(obj)


def model_fn(model_dir):
    """
    Load the model for inference
    """

    device = os.environ['device'] if('device' in os.environ) else 'cpu'

    if(device == 'gpu'):
        os.system('pip install -U paddlepaddle-gpu')
    else:
        os.system('pip install -U paddlepaddle')

    from paddleocr import PaddleOCR
    
    ocr = PaddleOCR(use_angle_cls=True, lang="ch")

    return ocr


def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """
    
    if request_content_type == 'image/jpg' or request_content_type == 'image/jpeg' or request_content_type == 'image/png':
        bytes = request_body
        image = Image.open(io.BytesIO(bytes)).convert('RGB')
        return asarray(image)
    elif request_content_type == 'application/json':
        data = request_body.decode('utf-8')
        data = json.loads(data)
        bucket = data['bucket']
        image_uri = data['image_uri']
        s3_object = s3_client.get_object(Bucket = bucket, Key = image_uri) 
        bytes = s3_object["Body"].read()
        image = Image.open(io.BytesIO(bytes)).convert('RGB')
        return asarray(image)
    else:
        return request_body
    
def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """
    
    preds = model.ocr(input_data, rec=True)

    result = {}

    label = []
    confidence = []
    bbox = []
    for pred in preds:
        label.append(pred[1][0])
        confidence.append(pred[1][1])
        bbox.append(pred[0])

    result['label'] = label
    result['confidence'] = confidence
    result['bbox'] = bbox

    response = [json.dumps(result, ensure_ascii = False, cls = MyEncoder)]

    return response    

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """

    return prediction