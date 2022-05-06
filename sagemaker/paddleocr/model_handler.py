import json
import boto3
import numpy as np
from paddleocr import PaddleOCR
from PIL import Image
from numpy import asarray
from sagemaker_inference import utils
import io

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

class ModelHandler(object):
    """
    A sample Model handler implementation.
    """

    def __init__(self):
        self.initialized = False
        self.ocr = None

    def initialize(self, context):
        """
        Initialize model. This will be called during model loading time
        :param context: Initial context contains model server system properties.
        :return:
        """
        self.ocr = PaddleOCR(use_angle_cls=True, lang="ch")

    def preprocess(self, request, context):
        """
        Transform raw input into model input data.
        :param request: list of raw requests
        :return: list of preprocessed model input data
        """
        # Take the input data and pre-process it make it inference ready
        
        request_processor = context.request_processor[0]
        request_property = request_processor.get_request_properties()
        request_content_type = utils.retrieve_content_type_header(request_property)        
        request_body = request[0].get("body")
        print(request_content_type)
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
            return request

    def inference(self, model_input):
        """
        Internal inference methods
        :param model_input: transformed model input data list
        :return: list of inference output in NDArray
        """
        # Do some inference call to engine here and return output
        
        input_data = model_input
        preds = self.ocr.ocr(input_data, rec=True)
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

        response = [json.dumps(result, ensure_ascii=False, cls=MyEncoder)]
        return response

    def postprocess(self, inference_output):
        """
        Return predict result in as list.
        :param inference_output: list of inference output
        :return: list of predict results
        """
        # Take output from network and post-process to desired format

        return inference_output

    def handle(self, data, context):
        """
        Call preprocess, inference and post-process functions
        :param data: input data
        :param context: mms context
        """

        model_input = self.preprocess(data, context)
        model_out = self.inference(model_input)
        return self.postprocess(model_out)


_service = ModelHandler()


def handle(data, context):
    if not _service.initialized:
        _service.initialize(context)

    if data is None:
        return None

    return _service.handle(data, context)