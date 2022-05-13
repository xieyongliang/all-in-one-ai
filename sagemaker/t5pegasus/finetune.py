#! -*- coding: utf-8 -*-
# 微调T5 PEGASUS做Seq2Seq任务
# 介绍链接：https://kexue.fm/archives/8209

from __future__ import print_function

import os
os.system('pip install -r requirements.txt')

import os
os.environ['TF_KERAS'] = '1'  # 必须使用tf.keras

import json
import argparse
import numpy as np
from tqdm import tqdm
from bert4keras.backend import keras, K
from bert4keras.layers import Loss
from bert4keras.models import build_transformer_model
from bert4keras.tokenizers import Tokenizer
from bert4keras.optimizers import Adam
from bert4keras.snippets import sequence_padding, open
from bert4keras.snippets import DataGenerator, AutoRegressiveDecoder
import tensorflow as tf
from keras.models import Model
from rouge import Rouge  # pip install rouge
from nltk.translate.bleu_score import sentence_bleu, SmoothingFunction
import jieba

jieba.initialize()

def parse_args():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--learning-rate", type=float, default=2e-4)
    
    parser.add_argument("--max-c-len", type=int, default=500)
    parser.add_argument("--max-t-len", type=int, default=200)

    parser.add_argument("--train-file", type=str, default='{0}/train.json'.format(os.environ['SM_CHANNEL_TRAIN']))
    parser.add_argument("--val-file", type=str, default='{0}/val.json'.format(os.environ['SM_CHANNEL_VAL']))
    parser.add_argument("--test-file", type=str, default='{0}/test.json'.format(os.environ['SM_CHANNEL_TEST']))
    parser.add_argument("--chinese-t5-pegasus-base", type=str, default=os.environ['SM_CHANNEL_CHINESE_T5_PEGASUS_BASE'])
    
    parser.add_argument("--model_dir", type=str, default=os.environ["SM_MODEL_DIR"])

    return parser.parse_args()

def load_data(filename):
    """加载数据
    单条格式：(标题, 正文)
    """
    D = []
    with open(filename, encoding='utf-8') as file:
        for line in file:
            data = json.loads(line)
            text = data['text']
            summary = data['summary']
            text = text.replace('\n', '').replace(' ', '')
            summary = summary.replace('\n', '').replace(' ', '')
            D.append((summary, text))
    return D

class data_generator(DataGenerator):
    """数据生成器
    """

    def __iter__(self, random=False):
        batch_c_token_ids, batch_t_token_ids = [], []
        for is_end, (title, content) in self.sample(random):
            c_token_ids, _ = tokenizer.encode(content, maxlen=max_c_len)
            t_token_ids, _ = tokenizer.encode(title, maxlen=max_t_len)
            batch_c_token_ids.append(c_token_ids)
            batch_t_token_ids.append(t_token_ids)
            if len(batch_c_token_ids) == self.batch_size or is_end:
                batch_c_token_ids = sequence_padding(batch_c_token_ids)
                batch_t_token_ids = sequence_padding(batch_t_token_ids)
                yield [batch_c_token_ids, batch_t_token_ids], None
                batch_c_token_ids, batch_t_token_ids = [], []


class CrossEntropy(Loss):
    """交叉熵作为loss，并mask掉输入部分
    """

    def compute_loss(self, inputs, mask=None):
        y_true, y_pred = inputs
        y_true = y_true[:, 1:]  # 目标token_ids
        y_mask = K.cast(mask[1], K.floatx())[:, 1:]  # 解码器自带mask
        y_pred = y_pred[:, :-1]  # 预测序列，错开一位
        loss = K.sparse_categorical_crossentropy(y_true, y_pred)
        loss = K.sum(loss * y_mask) / K.sum(y_mask)
        return loss


class AutoTitle(AutoRegressiveDecoder):
    """seq2seq解码器
    """

    @AutoRegressiveDecoder.wraps(default_rtype='probas')
    def predict(self, inputs, output_ids, states):
        c_encoded = inputs[0]
        return self.last_token(decoder).predict([c_encoded, output_ids])

    def generate(self, text, topk=1):
        c_token_ids, _ = tokenizer.encode(text, maxlen=max_c_len)
        c_encoded = encoder.predict(np.array([c_token_ids]))[0]
        output_ids = self.beam_search([c_encoded], topk=topk)  # 基于beam search
        return tokenizer.decode(output_ids)


class Evaluator(keras.callbacks.Callback):
    """评估与保存
    """

    def __init__(self):
        self.rouge = Rouge()
        self.smooth = SmoothingFunction().method1
        self.best_bleu = 0.

    def on_epoch_end(self, epoch, logs=None):
        metrics = self.evaluate(val_data)  # 评测模型
        if metrics['bleu'] > self.best_bleu:
            self.best_bleu = metrics['bleu']
            model.save_weights(os.path.join(os.environ["SM_MODEL_DIR"], 'best_model.weights'))  # 保存模型
        metrics['best_bleu'] = self.best_bleu
        print('val_data:', metrics)

    def evaluate(self, data, topk=1):
        total = 0
        rouge_1, rouge_2, rouge_l, bleu = 0, 0, 0, 0
        for title, content in tqdm(data):
            total += 1
            print(total)
            title = ' '.join(title).lower()
            pred_title = ' '.join(autotitle.generate(content, topk=topk)).lower()
                        
            if pred_title.strip():
                scores = self.rouge.get_scores(hyps=pred_title, refs=title)
                rouge_1 += scores[0]['rouge-1']['f']
                rouge_2 += scores[0]['rouge-2']['f']
                rouge_l += scores[0]['rouge-l']['f']
                bleu += sentence_bleu(
                    references=[title.split(' ')],
                    hypothesis=pred_title.split(' '),
                    smoothing_function=self.smooth
                )
        rouge_1 /= total
        rouge_2 /= total
        rouge_l /= total
        bleu /= total
        return {
            'rouge-1': rouge_1,
            'rouge-2': rouge_2,
            'rouge-l': rouge_l,
            'bleu': bleu,
        }


if __name__ == '__main__':
    
    args = parse_args()
    print(args)

    # 基本参数
    max_c_len = args.max_c_len  # 500
    max_t_len = args.max_t_len  # 200
    batch_size = args.batch_size  # 1
    epochs = args.epochs  # 40
    learning_rate = args.learning_rate  # 2e-4

    # 模型路径
    config_path = os.path.join(args.chinese_t5_pegasus_base, 'config.json')
    checkpoint_path = os.path.join(args.chinese_t5_pegasus_base, 'model.ckpt')
    dict_path = os.path.join(args.chinese_t5_pegasus_base, 'vocab.txt')
    
    # 加载数据集
    train_data = load_data(args.train_file)
    val_data = load_data(args.val_file)
    test_data = load_data(args.test_file)

    # 构建分词器
    tokenizer = Tokenizer(
        dict_path,
        do_lower_case=True,
        pre_tokenize=lambda s: jieba.cut(s, HMM=False)
    )

    t5 = build_transformer_model(
        config_path=config_path,
        checkpoint_path=checkpoint_path,
        model='t5.1.1',
        return_keras_model=False,
        name='T5',
    )

    encoder = t5.encoder
    decoder = t5.decoder
    model = t5.model
    model.summary()

    output = CrossEntropy(1)([model.inputs[1], model.outputs[0]])

    model = Model(model.inputs, output)
    model.compile(optimizer=Adam(learning_rate))
    
    autotitle = AutoTitle(
        start_id=tokenizer._token_start_id,
        end_id=tokenizer._token_end_id,
        maxlen=max_t_len
    )
    
    evaluator = Evaluator()
    train_generator = data_generator(train_data, batch_size)

    model.fit(
        train_generator.forfit(),
        steps_per_epoch=len(train_generator),
        epochs=epochs,
        callbacks=[evaluator]
    )

    # Save the model 
    model.save(os.environ["SM_MODEL_DIR"] + '/model_1')
