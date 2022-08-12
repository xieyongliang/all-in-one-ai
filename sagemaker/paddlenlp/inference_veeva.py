# Copyright (c) 2022 PaddlePaddle Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import json
import argparse
import numpy as np

def model_fn(model_dir):
    """
    Load the model for inference
    """

    args = parse_args()
    args.model_path_prefix = os.path.join(model_dir, 'inference')
    args.device = os.environ['device'] if('device' in os.environ) else 'cpu'
    args.schema = json.loads(os.environ['schema'])

    if(args.device == 'gpu'):
        os.system('pip install -U paddlepaddle-gpu')
        os.system('pip install -U onnxruntime-gpu')
        os.system('pip install nvgpu')
    else:
        os.system('pip install -U paddlepaddle')
        os.system('pip install -U onnxruntime')

    from uie_predictor import UIEPredictor

    predictor = UIEPredictor(args)
    return predictor


def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    if request_content_type == 'application/json':
        request = json.loads(request_body)
    else:
        # Handle other content-types here or raise an Exception
        # if the content type is not supported.  
        request = request_body
    
    return request

    
def predict_fn(input_data, model):
    inputs = [ input_data['inputs'] ]

    outputs = model.predict(inputs)

    input_data['SageMakerOutput'] = outputs
    return input_data

def output_fn(prediction, response_content_type):
    """
    Serialize and prepare the prediction output
    """

    if response_content_type == "application/json":
        response = json.dumps(prediction, ensure_ascii = False, cls = MyEncoder)
    else:
        response = str(prediction)

    return response    


def parse_args():
    parser = argparse.ArgumentParser()
#     # Required parameters
#     parser.add_argument(
#         "--model_path_prefix",
#         type=str,
#         required=True,
#         help="The path prefix of inference model to be used.", )
    parser.add_argument(
        "--position_prob",
        default=0.5,
        type=float,
        help="Probability threshold for start/end index probabiliry.", )
    parser.add_argument(
        "--max_seq_len",
        default=512,
        type=int,
        help="The maximum input sequence length. Sequences longer than this will be split automatically.",
    )
    
    parsed, unknown = parser.parse_known_args() # this is an 'internal' method
    # which returns 'parsed', the same as what parse_args() would return
    # and 'unknown', the remainder of that
    # the difference to parse_args() is that it does not exit when it finds redundant arguments

    for arg in unknown:
        if arg.startswith(("-", "--")):
            # you can pass any arguments to add_argument
            parser.add_argument(arg, type=str)

    args = parser.parse_args()
    return args

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

    