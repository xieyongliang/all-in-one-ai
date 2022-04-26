import argparse
import json
import logging
import os
import time
import shutil

import mxnet as mx
import numpy as np
import os, time, shutil

from mxnet import gluon, image, init, nd
from mxnet import autograd as ag
from mxnet.gluon import nn
from mxnet.gluon.data.vision import transforms
from gluoncv.utils import makedirs
from gluoncv.model_zoo import get_model
from gluoncv.data.transforms.presets.imagenet import transform_eval


def test(net, val_data, ctx):
    metric = mx.metric.Accuracy()
    for i, batch in enumerate(val_data):
        data = gluon.utils.split_and_load(batch[0], ctx_list=ctx, batch_axis=0, even_split=False)
        label = gluon.utils.split_and_load(batch[1], ctx_list=ctx, batch_axis=0, even_split=False)
        outputs = [net(X) for X in data]
        metric.update(label, outputs)
        # print(label, outputs)

    return metric.get()


def train(args):

    classes = args.classes  # 25

    epochs = args.epochs  # 10
    lr = args.learning_rate  # 0.001
    per_device_batch_size = args.batch_size  # 32
    momentum = args.momentum  # 0.9
    wd = args.wd  # 0.0001

    lr_factor = 0.75
    lr_steps = [10, 20, 30, np.inf]

    num_gpus = args.num_gpus  # 1
    num_workers = args.num_workers  # 8
    ctx = [mx.gpu(i) for i in range(num_gpus)] if num_gpus > 0 else [mx.cpu()]
    batch_size = per_device_batch_size * max(num_gpus, 1)


    jitter_param = 0.4
    lighting_param = 0.1

    transform_train = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomFlipLeftRight(),
        transforms.RandomColorJitter(brightness=jitter_param, contrast=jitter_param,
                                     saturation=jitter_param),
        transforms.RandomLighting(lighting_param),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    transform_test = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])


    train_path = args.train
    val_path = args.val
    test_path = args.test

    train_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(train_path).transform_first(transform_train),
        batch_size=batch_size, shuffle=True, num_workers=num_workers)

    val_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(val_path).transform_first(transform_test),
        batch_size=batch_size, shuffle=False, num_workers = num_workers)

    test_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(test_path).transform_first(transform_test),
        batch_size=batch_size, shuffle=False, num_workers = num_workers)


#     print(gluon.data.vision.ImageFolderDataset(train_path).synsets)
#     print(gluon.data.vision.ImageFolderDataset(val_path).synsets)
#     print(gluon.data.vision.ImageFolderDataset(test_path).synsets)


    model_name = args.model_name  # 'ResNet50_v2'
    finetune_net = get_model(model_name, pretrained=True)
    with finetune_net.name_scope():
        finetune_net.output = nn.Dense(classes)
    finetune_net.output.initialize(init.Xavier(), ctx = ctx)
    finetune_net.collect_params().reset_ctx(ctx)
    finetune_net.hybridize()

    trainer = gluon.Trainer(finetune_net.collect_params(), 'sgd', {
                            'learning_rate': lr, 'momentum': momentum, 'wd': wd})
    metric = mx.metric.Accuracy()
    L = gluon.loss.SoftmaxCrossEntropyLoss()
    
    lr_counter = 0
    num_batch = len(train_data)

    for epoch in range(epochs):
        if epoch == lr_steps[lr_counter]:
            trainer.set_learning_rate(trainer.learning_rate*lr_factor)
            lr_counter += 1

        tic = time.time()
        train_loss = 0
        metric.reset()

        for i, batch in enumerate(train_data):
    #         print(i)
            data = gluon.utils.split_and_load(batch[0], ctx_list=ctx, batch_axis=0, even_split=False)
            label = gluon.utils.split_and_load(batch[1], ctx_list=ctx, batch_axis=0, even_split=False)
    #         print(label)
            with ag.record():
                outputs = [finetune_net(X) for X in data]
                loss = [L(yhat, y) for yhat, y in zip(outputs, label)]
            for l in loss:
                l.backward()

            trainer.step(batch_size)
            train_loss += sum([l.mean().asscalar() for l in loss]) / len(loss)

            metric.update(label, outputs)

        _, train_acc = metric.get()
        train_loss /= num_batch

        _, val_acc = test(finetune_net, val_data, ctx)

        print('[Epoch %d] Train-acc: %.3f, loss: %.3f | Val-acc: %.3f | time: %.1f' %
                 (epoch, train_acc, train_loss, val_acc, time.time() - tic))

    _, test_acc = test(finetune_net, test_data, ctx)
    print('[Finished] Test-acc: %.3f' % (test_acc))

    finetune_net.save_parameters(os.path.join(args.model_dir, 'model-0000.params'))
    
    model_code_dir = os.path.join(args.model_dir, 'code')
    os.makedirs(model_code_dir)
    shutil.copy('/opt/ml/code/transfer_learning.py', model_code_dir)
    command = 'sed -i \'s/CLASSES/'+str(classes)+'/g\' '+os.path.join(model_code_dir, 'transfer_learning.py')
    print('command:', command)
    os.system(command)
    command = 'sed -i \'s/MODEL_NAME/'+str(model_name)+'/g\' '+os.path.join(model_code_dir, 'transfer_learning.py')
    print('command:', command)
    os.system(command)
#     shutil.copy('/opt/ml/code/requirements.txt', model_code_dir)
    with open(os.path.join(model_code_dir, 'requirements.txt'), 'w') as fout:
        fout.write('-i https://opentuna.cn/pypi/web/simple/\n')
        fout.write('gluoncv\n')

    
def get_embedding_advance(input_pic, seq_net, use_layer):
    # Load Images
#     img = image.imread(input_pic)
    img = input_pic
    
    ctx = [mx.cpu()]

    # Transform
    img = transform_eval(img).copyto(ctx[0])
    
    pred = None
    for i in range(len(seq_net)):
        img = seq_net[i](img)
        if i == use_layer:
#             print('[DEBUG] img.shape:', img.shape)
            pred = img[0]
            break

    return pred.asnumpy()

    
def model_fn(model_dir):
    classes = CLASSES  # 23
    model_name = 'MODEL_NAME'  # 'ResNet50_v2'
    
    ctx = [mx.cpu()]
    
    saved_params = os.path.join(model_dir, 'model-0000.params')
    if not os.path.exists(saved_params):
        saved_params = ''
    pretrained = True if saved_params == '' else False

    if not pretrained:
        net = get_model(model_name, classes=classes, pretrained=pretrained)
        net.load_parameters(saved_params)
    else:
        net = get_model(model_name, pretrained=pretrained)

    net.collect_params().reset_ctx(ctx)

    seq_net = nn.Sequential()
    for i in range(len(net.features)):
        seq_net.add(net.features[i])
        
    return seq_net


def input_fn(request_body, request_content_type):
#     print('[DEBUG] request_body:', type(request_body))
#     print('[DEBUG] request_content_type:', request_content_type)
    
    """An input_fn that loads a pickled tensor"""
    if request_content_type == 'application/x-npy':
        from io import BytesIO
        np_bytes = BytesIO(request_body)
        return mx.ndarray.array(np.load(np_bytes, allow_pickle=True))
    elif request_content_type == 'application/json':
        data = json.loads(request_body)
        return mx.ndarray.array(data)
    else:
        # Handle other content-types here or raise an Exception
        # if the content type is not supported.  
        return request_body
    return request_body


def predict_fn(input_data, model):
#     print('[DEBUG] input_data type:', type(input_data), input_data.shape)
    # TODO input_data should be (w,h,3)
    pred = get_embedding_advance(input_data, model, use_layer=12)
#     print('[DEBUG] pred:', pred)
    result = pred.tolist()
#     print('[DEBUG] result:', result)
    return json.dumps({'predictions': [result]})


def output_fn(prediction, content_type):
#     print('[DEBUG] prediction:', prediction)
#     print('[DEBUG] content_type:', content_type)
    return prediction

    
def parse_args():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("--classes", type=int, default=10)

    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--learning-rate", type=float, default=0.01)
    parser.add_argument("--momentum", type=float, default=0.9)
    parser.add_argument("--wd", type=float, default=0.0001)
    parser.add_argument("--num-gpus", type=int, default=1)
    parser.add_argument("--num-workers", type=int, default=8)
    parser.add_argument("--model-name", type=str, default='ResNet50_v2')

    parser.add_argument("--model-dir", type=str, default=os.environ["SM_MODEL_DIR"])
    parser.add_argument("--train", type=str, default=os.environ["SM_CHANNEL_TRAINING"])
    parser.add_argument("--val", type=str, default=os.environ["SM_CHANNEL_VALIDATION"])
    parser.add_argument("--test", type=str, default=os.environ["SM_CHANNEL_TEST"])

    parser.add_argument("--current-host", type=str, default=os.environ["SM_CURRENT_HOST"])
    parser.add_argument("--hosts", type=list, default=json.loads(os.environ["SM_HOSTS"]))

    return parser.parse_args()


if __name__ == "__main__":
    # train
    args = parse_args()
    train(args)
    
    # inference
#     model_dir = '../'
#     input_data = mx.ndarray.array(np.zeros(shape=(512, 512, 3)))
#     model = model_fn(model_dir)
#     result = predict_fn(input_data, model)
#     print(result)
