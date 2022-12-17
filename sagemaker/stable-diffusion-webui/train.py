import os
import argparse
import json

parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--train-task', type=str, help='Train task, either embedding or hypernetwork')
parser.add_argument('--train-args', type=str, help='Train arguments')
parser.add_argument('--embeddings-s3uri', default='', type=str, help='Embeddings S3Uri')
parser.add_argument('--hypernetwork-s3uri', default='', type=str, help='Hypernetwork S3Uri')
parser.add_argument('--ckpt', default='/opt/ml/input/data/models/768-v-ema.ckpt', type=str, help='SD model')
parser.add_argument('--region-name', type=str, help='Region Name')
parser.add_argument('--username', default='', type=str, help='Username')
parser.add_argument('--api-endpoint', default='', type=str, help='API Endpoint')

args = parser.parse_args()

cmd = "bash webui.sh --port 8080 --listen --xformers --train --train-task {0} --train-args '{1}' --embeddings-dir /opt/ml/input/data/embeddings --hypernetwork-dir /opt/ml/input/data/hypernetwork --ckpt {2} --ckpt-dir /opt/ml/input/data/models --region-name {3} --api-endpoint {4}".format(args.train_task, args.train_args, args.ckpt, args.region_name, args.api_endpoint)

if args.embeddings_s3uri != '':
    cmd = '{0} --embeddings-s3uri {1}'.format(cmd, args.embeddings_s3uri)

if args.hypernetwork_s3uri != '':
    cmd = '{0} --hypernetwork-s3uri {1}'.format(cmd, args.hypernetwork_s3uri)
    
if args.username != '':
    cmd = '{0} --username {1}'.format(cmd, args.username)

os.system('mkdir -p /opt/ml/input/data/embeddings')
os.system('mkdir -p /opt/ml/input/data/hypernetwork')
os.system(cmd)
