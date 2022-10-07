import os
import re
from typing import List
import dnnlib
import numpy as np
import PIL.Image
import torch
import boto3
import legacy
import uuid
import logging
from botocore.exceptions import ClientError
import shutil
import json
import sagemaker

#----------------------------------------------------------------------------

def num_range(s: str) -> List[int]:
    '''Accept either a comma separated list of numbers 'a,b,c' or a range 'a-c' and return as a list of ints.'''

    range_re = re.compile(r'^(\d+)-(\d+)$')
    m = range_re.match(s)
    if m:
        return list(range(int(m.group(1)), int(m.group(2))+1))
    vals = s.split(',')
    return [int(x) for x in vals]

#----------------------------------------------------------------------------

def upload_file(file_name, bucket, object_name=None):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """

    # If S3 object_name was not specified, use file_name
    if object_name is None:
        object_name = os.path.basename(file_name)

    # Upload the file
    s3_client = boto3.client('s3')
    try:
        response = s3_client.upload_file(file_name, bucket, object_name)
    except ClientError as e:
        logging.error(e)
        return False
    return True

#----------------------------------------------------------------------------

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key

#----------------------------------------------------------------------------

def generate_style_single(G, outdir, device_name, payload):
    seeds = num_range(payload['seeds']) if ('seeds' in payload) else None
    truncation_psi = float(payload['trunc']) if('trunc' in payload) else 1
    noise_mode = payload['noise-mode'] if('noise-mode' in payload) else 'const'
    class_idx = int(payload['class']) if('class' in payload) else None
    projected_w = payload['projected-w'] if('projected-w' in payload) else None

    device = torch.device(device_name)

    # Synthesize the result of a W projection.
    if projected_w is not None:
        if seeds is not None:
            print ('warn: --seeds is ignored when using --projected-w')
        print(f'Generating images from projected W "{projected_w}"')
        ws = np.load(projected_w)['w']
        ws = torch.tensor(ws, device=device) # pylint: disable=not-callable
        assert ws.shape[1:] == (G.num_ws, G.w_dim)
        for idx, w in enumerate(ws):
            img = G.synthesis(w.unsqueeze(0), noise_mode=noise_mode)
            img = (img.permute(0, 2, 3, 1) * 127.5 + 128).clamp(0, 255).to(torch.uint8)
            img = PIL.Image.fromarray(img[0].cpu().numpy(), 'RGB').save(f'{outdir}/proj{idx:02d}.png')
        return

    if seeds is None:
        print('--seeds option is required when not using --projected-w')
        exit(-1)

    # Labels.
    label = torch.zeros([1, G.c_dim], device=device)
    if G.c_dim != 0:
        if class_idx is None:
            print('Must specify class label with --class when using a conditional network')
            exit(-1)
        label[:, class_idx] = 1
    else:
        if class_idx is not None:
            print ('warn: --class=lbl ignored when running on an unconditional network')

    # Generate images.
    for seed_idx, seed in enumerate(seeds):
        print('Generating image for seed %d (%d/%d) ...' % (seed, seed_idx, len(seeds)))
        z = torch.from_numpy(np.random.RandomState(seed).randn(1, G.z_dim)).to(device)
        if(device_name == 'cpu'):
            img = G(z, label, truncation_psi=truncation_psi, noise_mode=noise_mode, force_fp32=True)
        else:
            img = G(z, label, truncation_psi=truncation_psi, noise_mode=noise_mode)
        img = (img.permute(0, 2, 3, 1) * 127.5 + 128).clamp(0, 255).to(torch.uint8)
        PIL.Image.fromarray(img[0].cpu().numpy(), 'RGB').save(f'{outdir}/seed{seed:04d}.png')

def generate_style_mixed(G, outdir, device_name, payload):
    truncation_psi = float(payload['trunc'])
    noise_mode = payload['noise-mode'] if('noise-mode' in payload) else 'const'
    row_seeds = num_range(payload['rows']) if ('rows' in payload) else None
    col_seeds = num_range(payload['cols']) if ('cols' in payload) else None
    col_styles = num_range(payload['styles']) if ('styles' in payload) else None

    device = torch.device(device_name)

    print('Generating W vectors...')
    all_seeds = list(set(row_seeds + col_seeds))
    all_z = np.stack([np.random.RandomState(seed).randn(G.z_dim) for seed in all_seeds])
    all_w = G.mapping(torch.from_numpy(all_z).to(device), None)
    w_avg = G.mapping.w_avg
    all_w = w_avg + (all_w - w_avg) * truncation_psi
    w_dict = {seed: w for seed, w in zip(all_seeds, list(all_w))}

    print('Generating images...')
    all_images = G.synthesis(all_w, noise_mode=noise_mode)
    all_images = (all_images.permute(0, 2, 3, 1) * 127.5 + 128).clamp(0, 255).to(torch.uint8).cpu().numpy()
    image_dict = {(seed, seed): image for seed, image in zip(all_seeds, list(all_images))}

    print('Generating style-mixed images...')
    for row_seed in row_seeds:
        for col_seed in col_seeds:
            w = w_dict[row_seed].clone()
            w[col_styles] = w_dict[col_seed][col_styles]
            image = G.synthesis(w[np.newaxis], noise_mode=noise_mode)
            image = (image.permute(0, 2, 3, 1) * 127.5 + 128).clamp(0, 255).to(torch.uint8)
            image_dict[(row_seed, col_seed)] = image[0].cpu().numpy()

    print('Saving images...')
    os.makedirs(outdir, exist_ok=True)
    for (row_seed, col_seed), image in image_dict.items():
        PIL.Image.fromarray(image, 'RGB').save(f'{outdir}/{row_seed}-{col_seed}.png')

    print('Saving image grid...')
    W = G.img_resolution
    H = G.img_resolution
    canvas = PIL.Image.new('RGB', (W * (len(col_seeds) + 1), H * (len(row_seeds) + 1)), 'black')
    for row_idx, row_seed in enumerate([0] + row_seeds):
        for col_idx, col_seed in enumerate([0] + col_seeds):
            if row_idx == 0 and col_idx == 0:
                continue
            key = (row_seed, col_seed)
            if row_idx == 0:
                key = (col_seed, col_seed)
            if col_idx == 0:
                key = (row_seed, row_seed)
            canvas.paste(PIL.Image.fromarray(image_dict[key], 'RGB'), (W * col_idx, H * row_idx))
    canvas.save(f'{outdir}/grid.png')

class ModelHandler(object):
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.initialized = False
        self.model = None
        self.device = None
    
    def transform_fn(self, data: any, context: any):
        print(data)
        print(context)
        data = json.loads(data[0]['body'].decode())
        payload = data['inputs']

        sagemaker_session = sagemaker.Session()
        bucket = sagemaker_session.default_bucket()
        default_output_s3uri = 's3://{0}/{1}/inference/output'.format(bucket, 'stylegan')
        output_s3uri = payload['output_s3uri'] if 'output_s3uri' in payload else default_output_s3uri

        outdir = '/tmp/{0}'.format(str(uuid.uuid4()))

        style = payload['style'] if('style' in payload) else 'single'

        outdir = '/tmp/{0}'.format(str(uuid.uuid4()))
        os.makedirs(outdir, exist_ok=True)

        if(style == 'single'):
            generate_style_single(self.model, outdir, self.device, payload)
        else:
            generate_style_mixed(self.model, outdir, self.device, payload)
        
        files = os.listdir(outdir)
        
        bucket, key = get_bucket_and_key(output_s3uri)

        result = []

        for file in files: 
            upload_file('{0}/{1}'.format(outdir, file), bucket, '{0}{1}'.format(key, file))
            result.append('{0}{1}'.format(output_s3uri, file))
        
        shutil.rmtree(outdir)
        
        print(result)
        return [result]

    def initialize(self, context):
        """
        Load the model for inference
        """
        try:
            if(torch.cuda.is_available()):
                self.device = 'cuda'
            else:
                self.device = 'cpu'
        except Exception as e:
            print(e)
            self.device = 'cpu'
        
        network_pkl = os.environ['network'] if('network' in os.environ) else None

        print('Loading networks from "%s"...' % network_pkl)
        if(network_pkl is not None):
            with dnnlib.util.open_url(network_pkl) as f:
                G = legacy.load_network_pkl(f)['G_ema'].to(self.device) # type: ignore
        else:
            directories = os.listdir('/opt/ml/model')
            kimgstr = directories[0][directories[0].rfind('-') + 1 : ]
            kimg = kimgstr[4 : ]
            suffix = '0' * (6 - len(kimg)) + kimg + '.pkl'
            files = os.listdir('/opt/ml/model/{0}'.format(directories[0]))
            for file in files:
                if(file.endswith(suffix)): 
                    print('/opt/ml/model/{0}/{1}'.format(directories[0], file))                   
                    with dnnlib.util.open_url('/opt/ml/model/{0}/{1}'.format(directories[0], file)) as f:
                        G = legacy.load_network_pkl(f)['G_ema'].to(self.device) # type: ignore
                    break

        self.model = G
    
    def handle(self, data, context):
        """
        Call preprocess, inference and post-process functions
        :param data: input data
        :param context: mms context
        """

        return self.transform_fn(data, context)

_service = ModelHandler()


def handle(data, context):
    if not _service.initialized:
        _service.initialize(context)

    if data is None:
        return None

    return _service.handle(data, context)