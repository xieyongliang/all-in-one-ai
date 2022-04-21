# -*- coding: utf-8 -*-
import sys
import json
import os
import flask
import boto3
import uuid
import os

import sys

sys.path.append('/opt/yolov5')

from pathlib import Path

import torch
import torch.backends.cudnn as cudnn
from models.common import DetectMultiBackend
from utils.datasets import LoadImages
from utils.general import non_max_suppression, scale_coords, xyxy2xywh, set_logging
from utils.torch_utils import select_device, time_sync

# The flask app for serving predictions
app = flask.Flask(__name__)

s3_client = boto3.client('s3')

print(os.environ)
name = os.environ['name'] if('name' in os.environ) else 'tutorial'
weights = os.environ['weights'] if ('weights' in os.environ) else '/opt/ml/model/{}/weights/best.pt'.format(name)
data = os.environ['data'] if('data' in os.environ) else '/opt/yolov5/data/coco128.yaml'
imgsz = int(os.environ['imgsz']) if('imgsz' in os.environ) else 640 
conf_thres = float(os.environ['conf_thres']) if('conf_thres' in os.environ) else 0.25
iou_thres = float(os.environ['iou_thres']) if('iou_thres' in os.environ) else 0.45
max_det = int(os.environ['max_det']) if('max_det' in os.environ) else 1000
device = os.environ['device'] if('device' in os.environ) else 'cpu'
classes = os.environ['classes'] if('classes' in os.environ) else None
agnostic_nms = bool(os.environ['agnostic_nms']) if('agnostic_nms' in os.environ) else False
augment = bool(os.environ['augment']) if('augment' in os.environ) else False
half = bool(os.environ['half']) if('half' in os.environ) else False

def init(weights='yolov5s.pt',  # model.pt path(s)
        data='data/coco128.yaml',  # dataset.yaml path
        device='',  # cuda device, i.e. 0 or 0,1,2,3 or cpu
        half=False,  # use FP16 half-precision inference
        dnn=False,  # use OpenCV DNN for ONNX inference
    ):
    # Initialize
    set_logging()
    device = select_device(device)
    half &= device.type != 'cpu'  # half precision only supported on CUDA

    # Load model
    model = DetectMultiBackend(weights, device=device, dnn=dnn, data=data, fp16=half)
    stride, names = model.stride, model.names

    return model, names, stride

model, names, stride = init(weights=weights, device=device, half=half, data=data)

def detect(source):
    dataset = LoadImages(source, img_size=[imgsz, imgsz], stride=stride)

    for path, im, im0s, vid_cap, s in dataset:
        im = torch.from_numpy(im).to(device)
        im = im.half() if model.fp16 else im.float()  # uint8 to fp16/32
        im /= 255  # 0 - 255 to 0.0 - 1.0
        if len(im.shape) == 3:
            im = im[None]  # expand for batch dim

        # Inference
        t1 = time_sync()
        pred = model(im, augment=augment)

        # Apply NMS
        pred = non_max_suppression(pred, conf_thres, iou_thres, classes, agnostic_nms, max_det=max_det)
        t2 = time_sync()
        
        # Process detections
        result = []
        for i, det in enumerate(pred):  # detections per image
            p, im0, frame = path, im0s.copy(), getattr(dataset, 'frame', 0)

            p = Path(p)  # to Path
            s += '%gx%g ' % im.shape[2:]  # print string
            gn = torch.tensor(im0.shape)[[1, 0, 1, 0]]  # normalization gain whwh
            if len(det):
                # Rescale boxes from img_size to im0 size
                det[:, :4] = scale_coords(im.shape[2:], det[:, :4], im0.shape).round()

                # Print results
                for c in det[:, -1].unique():
                    n = (det[:, -1] == c).sum()  # detections per class
                    s += f"{n} {names[int(c)]}{'s' * (n > 1)}, "  # add to string

                # Write results
                for *xyxy, conf, cls in reversed(det):
                    xywh = (xyxy2xywh(torch.tensor(xyxy).view(1, 4)) / gn).view(-1).tolist()  # normalized xywh
                    line = (cls, *xywh)  # label format
                    line = ('%g ' * len(line)).rstrip() % line
                    result.append(line)

            # Print time (inference + NMS)
            print(f'{s}Done. ({t2 - t1:.3f}s)')

    print('result:', result)
    return result

@app.route('/ping', methods=['GET'])
def ping():
    """Determine if the container is working and healthy. In this sample container, we declare
    it healthy if we can load the model successfully."""
    # health = ScoringService.get_model() is not None  # You can insert a health check here
    health = 1

    status = 200 if health else 404
    # print("===================== PING ===================")
    return flask.Response(response="{'status': 'Healthy'}\n", status=status, mimetype='application/json')

@app.route('/invocations', methods=['POST'])
def invocations():
    """Do an inference on a single batch of data. In this sample server, we take data as CSV, convert
    it to a pandas data frame for internal use and then convert the predictions back to CSV (which really
    just means one prediction per line, since there's a single column.
    """
    data = None
    print("================ INVOCATIONS =================")

    #parse json in request
    print ("<<<< flask.request.content_type", flask.request.content_type)

    if flask.request.content_type != 'application/json':
        content_type=flask.request.content_type
        download_file_name = '/tmp/{0}.{1}'.format(str(uuid.uuid4()), content_type[content_type.rfind("/") + 1: ]) 
        image = open(download_file_name, "wb")
        image.write(flask.request.data)
        image.close()
        print ("<<<<download_file_name ", download_file_name)
    else:
        data = flask.request.data.decode('utf-8')
        data = json.loads(data)

        bucket = data['bucket']
        image_uri = data['image_uri']

        download_file_name = '/tmp/'+image_uri.split('/')[-1]
        print ("<<<<download_file_name ", download_file_name)

        try:
            s3_client.download_file(bucket, image_uri, download_file_name)
        except:
            #local test
            download_file_name = './bus.jpg'

        print('Download finished!')
    
    inference_result = detect(download_file_name)
    
    _payload = json.dumps(inference_result,ensure_ascii=False)
    
    os.remove(download_file_name)
  
    return flask.Response(response=_payload, status=200, mimetype='application/json')

