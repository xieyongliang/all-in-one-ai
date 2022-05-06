import jieba
import numpy as np
import tensorflow as tf
import os
from bert4keras.models import build_transformer_model
from bert4keras.snippets import AutoRegressiveDecoder
from bert4keras.tokenizers import Tokenizer

def model_fn(model_dir):
    """
    Load the model for inference
    """
    config_path = '{0}/chinese_t5_pegasus_base/config.json'.format(model_dir)
    checkpoint_path = '{0}/chinese_t5_pegasus_base/model.ckpt'.format(model_dir)
    dict_path = '{0}/chinese_t5_pegasus_base/vocab.txt'.format(model_dir)
    gpus = tf.config.experimental.list_physical_devices('GPU')  ##获取可用GPU
    for gpu in (gpus):
        tf.config.experimental.set_memory_growth(gpu, True)  ##设置显存使用方式
    
    max_c_len = os.environ['max_c_len'] if ('max_c_len' in os.os.environ) else 500
    max_t_len = os.environ['max_t_len'] if ('max_t_len' in os.os.environ) else 200

    tokenizer = Tokenizer(
        dict_path,
        do_lower_case=True,
        pre_tokenize=lambda s: jieba.cut(s, HMM=False)
    )

    t5 = build_transformer_model(
        config_path = config_path,
        checkpoint_path = checkpoint_path,
        model = 't5.1.1',
        return_keras_model = False,
        name = 'T5',
    )

    encoder = t5.encoder
    decoder = t5.decoder
    model = t5.model

    model.load_weights('/home/ec2-user/SageMaker/bert_model/best_model.weights')

    autotitle = AutoTitle(
        start_id = tokenizer._token_start_id,
        end_id = tokenizer._token_end_id,
        maxlen = max_t_len,
        encoder = encoder,
        decoder = decoder,
        tokenizer = tokenizer,
        max_c_len = max_c_len
    )
    return autotitle
    
def predict_fn(input_data, model):
    """
    Apply model to the incoming request
    """

    model.generate(input_data)

def input_fn(request_body, request_content_type):
    """
    Deserialize and prepare the prediction input
    """

    return request_body

def output_fn(prediction, content_type):
    """
    Serialize and prepare the prediction output
    """
    
    return prediction

class AutoTitle(AutoRegressiveDecoder):
    """seq2seq解码器
    """
    def __init__(self, encoder, decoder, tokenizer, max_c_len):
        self.encoder = encoder
        self.decoder = decoder
        self.tokenizer = tokenizer
        self.max_c_len = max_c_len

    @AutoRegressiveDecoder.wraps(default_rtype='probas')
    def predict(self, inputs, output_ids, states):
        c_encoded = inputs[0]
        return self.last_token(self.decoder).predict([c_encoded, output_ids])

    def generate(self, text, topk=1):
        c_token_ids, _ = self.tokenizer.encode(text, maxlen=self.max_c_len)
        c_encoded = self.encoder.predict(np.array([c_token_ids]))[0]
        output_ids = self.beam_search([c_encoded], topk=topk)  # 基于beam search
        return self.tokenizer.decode(output_ids)

