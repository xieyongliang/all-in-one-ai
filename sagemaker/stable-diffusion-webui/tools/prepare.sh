#!/bin/bash
if [ "$#" -ne 1 ]; then
    echo "usage: $0 [region]"
    exit 1
fi

if [ ! -f "./s5cmd" ]; then
    wget https://github.com/peak/s5cmd/releases/download/v2.0.0/s5cmd_2.0.0_Linux-64bit.tar.gz -O ./s5cmd_2.0.0_Linux-64bit.tar.gz
    tar xzvf s5cmd_2.0.0_Linux-64bit.tar.gz
fi

userid=$(aws sts get-caller-identity | jq -r .Account)
region=$1
aws s3 mb s3://sagemaker-${region}-${userid} --region ${region}
echo "Uploading models/ to s3://sagemaker-${region}-${userid}/stable-diffusion-webui/models/"
AWS_REGION=${region} ./s5cmd cp models/ s3://sagemaker-${region}-${userid}/stable-diffusion-webui/models/