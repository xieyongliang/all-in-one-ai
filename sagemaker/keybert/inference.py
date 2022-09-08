import json
from keybert import KeyBERT


def model_fn(model_dir):
    """
    Load the model for inference
    """
    kw_model = KeyBERT()
    return kw_model


def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """
    keywords = model.extract_keywords(input_data)
    return keywords


def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'application/json':
        data = json.loads(request_body)
        return data['inputs']
    else:
        return request_body

    
def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """
    return json.dumps({'result': prediction}, ensure_ascii=False)
