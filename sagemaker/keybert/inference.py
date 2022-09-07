import os
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
    return json.dumps({'keywords': prediction}, ensure_ascii=False)


if __name__=='__main__':
    doc = """
         Supervised learning is the machine learning task of learning a function that
         maps an input to an output based on example input-output pairs. It infers a
         function from labeled training data consisting of a set of training examples.
         In supervised learning, each example is a pair consisting of an input object
         (typically a vector) and a desired output value (also called the supervisory signal).
         A supervised learning algorithm analyzes the training data and produces an inferred function,
         which can be used for mapping new examples. An optimal scenario will allow for the
         algorithm to correctly determine the class labels for unseen instances. This requires
         the learning algorithm to generalize from the training data to unseen situations in a
         'reasonable' way (see inductive bias).
      """
    
    model_dir = '../'
    model = model_fn(model_dir)
    request_body = json.dumps({'text': doc})
    input_data = input_fn(request_body, 'application/json')
    prediction = predict_fn(input_data, model)
    result = output_fn(prediction, 'application/json')
    print(result)