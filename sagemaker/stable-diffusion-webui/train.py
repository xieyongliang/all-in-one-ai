import os
import argparse

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--train-task', type=str, help='Train task, either embedding or hypernetwork')
parser.add_argument('--train-args', type=str, help='Train arguments')
parser.add_argument("--ckpt", type=str, default='', help="path to checkpoint of stable diffusion model; if specified, this checkpoint will be added to the list of checkpoints and loaded",)
parser.add_argument('--embeddings-s3uri', default='', type=str, help='Embeddings S3Uri')
parser.add_argument('--hypernetwork-s3uri', default='', type=str, help='Hypernetwork S3Uri')
parser.add_argument('--sd-models-s3uri', default='', type=str, help='SD Models S3Uri')
parser.add_argument('--db-models-s3uri', default='', type=str, help='DB Models S3Uri')
parser.add_argument('--lora-models-s3uri', default='', type=str, help='Lora Models S3Uri')
parser.add_argument('--username', default='', type=str, help='Username')
parser.add_argument('--api-endpoint', default='', type=str, help='API Endpoint')
parser.add_argument('--dreambooth-config-id', default='', type=str, help='Dreambooth config ID')
parser.add_argument('--model-name', default='', type=str, help='Model name')
parser.add_argument('--region-name', default='', type=str, help='Region name')

args = parser.parse_args()

cmd = "LD_LIBRARY_PATH=/opt/conda/lib:$LD_LIBRARY_PATH ACCELERATE=true bash webui.sh --port 8080 --listen --xformers --train --train-task {0} --train-args '{1}' --embeddings-dir /opt/ml/input/data/embeddings --hypernetwork-dir /opt/ml/input/data/hypernetwork --lora-models-path /opt/ml/input/data/lora --dreambooth-models-path /opt/ml/input/data/dreambooth  --ckpt-dir /opt/ml/input/data/models --api-endpoint {2}".format(args.train_task, args.train_args, args.api_endpoint)

if args.embeddings_s3uri != '':
    cmd = '{0} --embeddings-s3uri {1}'.format(cmd, args.embeddings_s3uri)

if args.hypernetwork_s3uri != '':
    cmd = '{0} --hypernetwork-s3uri {1}'.format(cmd, args.hypernetwork_s3uri)

if args.sd_models_s3uri != '':
    cmd = '{0} --sd-models-s3uri {1}'.format(cmd, args.sd_models_s3uri)

if args.db_models_s3uri != '':
    cmd = '{0} --db-models-s3uri {1}'.format(cmd, args.db_models_s3uri)

if args.lora_models_s3uri != '':
    cmd = '{0} --lora-models-s3uri {1}'.format(cmd, args.lora_models_s3uri)

if args.username != '':
    cmd = '{0} --username {1}'.format(cmd, args.username)

if args.model_name != '':
    cmd = '{0} --model-name {1}'.format(cmd, args.model_name)

if args.region_name != '':
    cmd = '{0} --region-name {1}'.format(cmd, args.region_name)

if args.dreambooth_config_id != '':
    cmd = '{0} --dreambooth-config-id {1}'.format(cmd, args.dreambooth_config_id)

if args.ckpt != '':
    cmd = '{0} --ckpt {1}'.format(cmd, args.ckpt)

os.system('mkdir -p /opt/ml/input/data/embeddings')
os.system('mkdir -p /opt/ml/input/data/hypernetwork')
os.system('mkdir -p /opt/ml/input/data/lora')
os.system('mkdir -p /opt/ml/input/data/dreambooth')
os.system('mkdir -p /opt/ml/input/data/models')

os.system(cmd)
