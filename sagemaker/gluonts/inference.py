import json
import os
from pathlib import Path
import numpy as np

from gluonts.dataset.common import ListDataset
from gluonts.dataset.field_names import FieldName
from gluonts.model.predictor import Predictor

def parse_data(dataset):
    data = []
    for t in dataset:
        datai = {FieldName.TARGET: t['target'], FieldName.START: t['start']}
        if 'id' in t:
            datai[FieldName.ITEM_ID] = t['item_id']
        if 'cat' in t:
            datai[FieldName.FEAT_STATIC_CAT] = t['cat']
        if 'dynamic_feat' in t:
            datai[FieldName.FEAT_DYNAMIC_REAL] = t['dynamic_feat']
        print('DEBUG: ', datai)
        data.append(datai)
    print('data: ', data)
    return data

def transform_fn(model: Predictor, request_body: any, content_type: any, accept_type: any):
    print('[DEBUG] request_body:', type(request_body))
    print('[DEBUG] content_type:', content_type)
    print('[DEBUG] accept_type:', accept_type)

    request_body = json.loads(request_body)
    input_data = request_body['inputs']

    if isinstance(input_data, dict):
        input_data = [input_data]

    if 'freq' in os.environ:
        freq = os.environ['freq']
    else:
        freq = '1H'

    if 'target_quantile' in os.environ:
        target_quantile = float(os.environ['target_quantile'])
    else:
        target_quantile = 0.5
    
    if 'use_log1p' in os.environ:
        use_log1p = (os.environ['use_log1p'] == 'True')
    else:
        use_log1p = False

    ds = ListDataset(parse_data(input_data), freq=freq)
    
    inference_result = model.predict(ds)
    
    if use_log1p:
        result = [np.expm1(resulti.quantile(target_quantile)).tolist() for resulti in inference_result]
    else:
        result = [resulti.quantile(target_quantile).tolist() for resulti in inference_result]

    return { 'result' : result }, 'application/json'

def model_fn(model_dir):
    """
    Load the model for inference
    """
    
    sub_dirs = os.listdir(model_dir)
    print('[DEBUG] sub_dirs:', sub_dirs)
    for sub_dir in sub_dirs:
        if sub_dir in ['CanonicalRNN', 'DeepFactor', 'DeepAR', 'DeepState', 'DeepVAR', 'GaussianProcess', 'GPVAR', 'LSTNet', 'NBEATS', 'DeepRenewalProcess', 'Tree', 'SelfAttention', 'MQCNN', 'MQRNN', 'Seq2Seq', 'SimpleFeedForward', 'TemporalFusionTransformer', 'DeepTPP', 'Transformer', 'WaveNet', 'Naive2', 'NPTS', 'SeasonalNaive', 'Prophet', 'ARIMA', 'ETS', 'TBATS', 'THETAF', 'STLAR', 'CROSTON', 'MLP']:  # TODO add all algo_names
            model_dir = os.path.join(model_dir, sub_dir)
            print('[DEBUG] algo_name:', sub_dir)
            break
    predictor = Predictor.deserialize(Path(model_dir))

    print('[DEBUG] model init done.')
    return predictor
