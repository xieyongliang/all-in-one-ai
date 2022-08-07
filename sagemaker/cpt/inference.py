import json
import os
from transformers import BertTokenizer
from lib.modeling_cpt import CPTForConditionalGeneration

def model_fn(model_dir):
    """
    Load the model for inference
    """

    engine = CPTForConditionalGeneration.from_pretrained(model_dir)
    tokenizer = BertTokenizer.from_pretrained(model_dir)

    return engine, tokenizer

def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    engine, tokenizer = model

    data = input_data['inputs']
    input_max_length = int(os.environ['input_max_length']) if ('input_max_length' in os.environ) else 512
    inputs = tokenizer(data, return_tensors="pt",max_length=input_max_length)
    output_max_length = int(os.environ['output_max_length']) if ('output_max_length' in os.environ) else 512
    top_p = float(os.environ['top_p']) if ('top_p' in os.environ) else 0.95
    outputs = engine.generate(inputs['input_ids'], max_length=output_max_length, top_p=top_p)
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