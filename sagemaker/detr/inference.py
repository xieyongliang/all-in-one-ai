import json
import io
import os
import boto3
from transformers import DetrImageProcessor, DetrForObjectDetection
import torch
from PIL import Image

s3_client = boto3.client('s3')

def model_fn(model_dir):
    """
    Load the model for inference
    """

    processor = DetrImageProcessor.from_pretrained("facebook/detr-resnet-101")
    model = DetrForObjectDetection.from_pretrained("facebook/detr-resnet-101")

    return model, processor

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'image/jpg' or request_content_type == 'image/jpeg' or request_content_type == 'image/png':
        bytes = request_body
        return Image.open(io.BytesIO(bytes))
    elif request_content_type == 'application/json':
        data = request_body
        data = json.loads(data)
        bucket = data['bucket']
        image_uri = data['image_uri']
        s3_object = s3_client.get_object(Bucket = bucket, Key = image_uri) 
        bytes = s3_object["Body"].read()
        return Image.open(io.BytesIO(bytes))
    else:
        return request_body
    
def predict_fn(input_data, models):
    """
    Apply model to the incoming request
    """

    model = models[0]
    processor = models[1]
    image = input_data

    inputs = processor(images=image, return_tensors="pt")
    outputs = model(**inputs)

    target_sizes = torch.tensor([image.size[::-1]])
    results = processor.post_process_object_detection(outputs, target_sizes=target_sizes, threshold=0.9)[0]

    output = []

    for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
        box = [round(i, 2) for i in box.tolist()]
        print(
            f"Detected {model.config.id2label[label.item()]} with confidence "
            f"{round(score.item(), 3)} at location {box}"
        )
        output.append({
            'name': model.config.id2label[label.item()],
            'confidence': round(score.item(), 3),
            'location': box
        })

    return output

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """

    return json.dumps(prediction)
