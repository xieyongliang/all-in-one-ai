import argparse
import mxnet as mx
import numpy as np
import os, time
from mxnet import gluon, init
from mxnet import autograd as ag
from mxnet.gluon import nn
from mxnet.gluon.data.vision import transforms
from gluoncv.model_zoo import get_model

def test(net, val_data, ctx):
    metric = mx.metric.Accuracy()
    for i, batch in enumerate(val_data):
        data = gluon.utils.split_and_load(batch[0], ctx_list=ctx, batch_axis=0, even_split=False)
        label = gluon.utils.split_and_load(batch[1], ctx_list=ctx, batch_axis=0, even_split=False)
        outputs = [net(X) for X in data]
        metric.update(label, outputs)

    return metric.get()


def train(args):
    classes = args.classes  # 25
    epochs = args.epochs  # 10
    learning_rate = args.learning_rate  # 0.001
    per_device_batch_size = args.batch_size  # 32
    momentum = args.momentum  # 0.9
    wd = args.wd  # 0.0001

    learning_rate_factor = 0.75
    learning_rate_steps = [10, 20, 30, np.inf]

    num_workers = args.num_workers  # 8
    ctx = [mx.gpu(i) for i in range(mx.context.num_gpus())] if mx.context.num_gpus() else [mx.cpu()]

    batch_size = per_device_batch_size * max(mx.context.num_gpus(), 1)

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

    train_dir = args.train_dir
    validation_dir = args.validation_dir
    test_dir = args.test_dir

    train_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(train_dir).transform_first(transform_train),
        batch_size=batch_size, shuffle=True, num_workers=num_workers)

    val_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(validation_dir).transform_first(transform_test),
        batch_size=batch_size, shuffle=False, num_workers=num_workers)

    test_data = gluon.data.DataLoader(
        gluon.data.vision.ImageFolderDataset(test_dir).transform_first(transform_test),
        batch_size=batch_size, shuffle=False, num_workers=num_workers)

    model_name = args.model_name  # 'ResNet50_v2'
    finetune_net = get_model(model_name, pretrained=True)
    with finetune_net.name_scope():
        finetune_net.output = nn.Dense(classes)
    finetune_net.output.initialize(init.Xavier(), ctx=ctx)
    finetune_net.collect_params().reset_ctx(ctx)
    finetune_net.hybridize()

    trainer = gluon.Trainer(finetune_net.collect_params(), 'sgd', {
                            'learning_rate': learning_rate, 'momentum': momentum, 'wd': wd})
    metric = mx.metric.Accuracy()
    L = gluon.loss.SoftmaxCrossEntropyLoss()
    
    learning_rate_counter = 0
    num_batch = len(train_data)

    for epoch in range(epochs):
        if epoch == learning_rate_steps[learning_rate_counter]:
            trainer.set_learning_rate(trainer.learning_rate*learning_rate_factor)
            learning_rate_counter += 1

        tic = time.time()
        train_loss = 0
        metric.reset()

        for i, batch in enumerate(train_data):
            data = gluon.utils.split_and_load(batch[0], ctx_list=ctx, batch_axis=0, even_split=False)
            label = gluon.utils.split_and_load(batch[1], ctx_list=ctx, batch_axis=0, even_split=False)
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

    finetune_net.save_parameters(os.path.join(args.output_dir, 'model-0000.params'))
    
def parse_args():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("--classes", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=100)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--learning_rate", type=float, default=0.01)
    parser.add_argument("--momentum", type=float, default=0.9)
    parser.add_argument("--wd", type=float, default=0.0001)
    parser.add_argument("--num_workers", type=int, default=8)
    parser.add_argument("--model_name", type=str, default='ResNet50_v2')
    parser.add_argument("--output_dir", type=str, default='/opt/ml/model')
    parser.add_argument("--train_dir", type=str, default='/opt/ml/input/data/train')
    parser.add_argument("--validation_dir", type=str, default='/opt/ml/input/data/val')
    parser.add_argument("--test_dir", type=str, default='/opt/ml/input/data/test')

    return parser.parse_args()

if __name__ == "__main__":
    args = parse_args()
    train(args)