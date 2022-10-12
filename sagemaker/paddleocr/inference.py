import io
import os
import json
import boto3
import numpy as np
from PIL import Image
from numpy import asarray
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

    task =  os.environ['task'] if('task' in os.environ) else 'ocr'
    device = os.environ['device'] if('device' in os.environ) else 'cpu'
    det_model_dir = os.environ['det_model_dir'] if('det_model_dir' in os.environ) else None
    rec_model_dir = os.environ['rec_model_dir'] if('rec_model_dir' in os.environ) else None
    cls_model_dir = os.environ['cls_model_dir'] if('cls_model_dir' in os.environ) else None
    table_model_dir = os.environ['table_model_dir'] if('table_model_dir' in os.environ) else None
    rec_char_dict_path = os.environ['rec_char_dict_path'] if('rec_char_dict_path' in os.environ) else None
    table_char_dict_path = os.environ['table_char_dict_path'] if('table_char_dict_path' in os.environ) else None
    lang = os.environ['lang'] if('lang' in os.environ) else 'ch'
    table = os.environ['table'] if('table' in os.environ) else True
    layout = os.environ['layout'] if('layout' in os.environ) else True
    ocr = os.environ['ocr'] if('ocr' in os.environ) else True
    use_gpu = (device == 'gpu')

    if(device == 'gpu'):
        os.system('pip install -U paddlepaddle-gpu')
    else:
        os.system('pip install -U paddlepaddle')

    from paddleocr import PaddleOCR, PPStructure
    
    if task == 'ocr':
        engine = PaddleOCR(
            use_gpu=use_gpu, 
            use_angle_cls=True, 
            lang=lang, 
            det_model_dir=det_model_dir, 
            rec_model_dir=rec_model_dir, 
            cls_model_dir=cls_model_dir
        )
    else:
        engine = PPStructure(
            use_gpu=use_gpu, 
            lang=lang, 
            det_model_dir=det_model_dir, 
            rec_model_dir=rec_model_dir, 
            table_model_dir=table_model_dir, 
            rec_char_dict_path=rec_char_dict_path, 
            table_char_dict_path=table_char_dict_path,
            layout=layout,
            table=table,
            ocr=ocr
        )

    print(engine)
    print(task)
    return engine, task


def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """
    
    if request_content_type == 'image/jpg' or request_content_type == 'image/jpeg' or request_content_type == 'image/png':
        bytes = request_body
        image = Image.open(io.BytesIO(bytes)).convert('RGB')
        return asarray(image)
    elif request_content_type == 'application/json':
        data = json.loads(request_body)
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
    engine, task = model
    if(task == 'ocr'):
        preds = engine.ocr(input_data, rec=True)
    else:
        preds = engine(input_data)

    if(task == 'ocr'):
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
    else:
        result = []
        for pred in preds:
            result.append(pred['res'])

    response = json.dumps(result, ensure_ascii = False, cls = MyEncoder)

    return response    

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """

    return prediction