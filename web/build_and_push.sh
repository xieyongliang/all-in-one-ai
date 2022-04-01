#!/bin/bash
set -v
set -e
# This script shows how to build the Docker image and push it to ECR to be ready for use
# by SageMaker.

# The argument to this script is the image name. This will be used as the image on the local
# machine and combined with the account and region to form the repository name for ECR.
if [ "$#" -ne 1 ]; then
    echo "usage: $0 [region-name]"
    exit 1
fi

image="all-in-one-ai-web"

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)

# Get the region defined in the current configuration
region=$1

if [[ $region =~ ^cn.* ]]
then
    fullname="${account}.dkr.ecr.${region}.amazonaws.com.cn/${image}:latest"
    aws_endpoint="amazonaws.com.cn"
else
    fullname="${account}.dkr.ecr.${region}.amazonaws.com/${image}:latest"
    aws_endpoint="amazonaws.com"
fi

echo ${fullname}

# If the repository doesn't exist in ECR, create it.
aws ecr describe-repositories --repository-names "${image}" --region ${region} || aws ecr create-repository --repository-name "${image}" --region ${region}

if [ $? -ne 0 ]
then
    aws ecr create-repository --repository-name "${image}" --region ${region}
fi

aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.${aws_endpoint}

aws ecr set-repository-policy \
    --repository-name "${image}" \
    --policy-text "file://ecr-policy.json" \
    --region ${region}

# Build the docker image, tag with full name and then push it to ECR
docker build -t ${image} -f Dockerfile .

docker tag ${image} ${fullname}
docker push ${fullname}

