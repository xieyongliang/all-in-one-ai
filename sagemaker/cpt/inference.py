import json
import os
from transformers import BertTokenizer
from lib.modeling_cpt import CPTForConditionalGeneration

def model_fn(model_dir):
    """
    Load the model for inference
    """

    model = CPTForConditionalGeneration.from_pretrained(model_dir)
    tokenizer = BertTokenizer.from_pretrained(model_dir)

    model_dict = {'model': model, 'tokenizer':tokenizer}
    
    return model_dict

def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    tokenizer = model['tokenizer']
    model = model['model']

    data = input_data['inputs']
    inputs = tokenizer(data, return_tensors="pt",max_length=512)
    outputs = model.generate(inputs['input_ids'], max_length=512, top_p=0.95)
    result =  {
        'result': tokenizer.decode(outputs[0])
    }

    return result

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """
    
    if request_content_type == "application/json":
        request = json.loads(request_body)
    else:
        request = request_body

    return request

def output_fn(prediction, response_content_type):
    """
    Serialize and prepare the prediction output
    """
    
    if response_content_type == "application/json":
        response = json.dumps(prediction)
    else:
        response = str(prediction)

    return response