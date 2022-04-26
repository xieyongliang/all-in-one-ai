#!/usr/bin/env bash

# This script shows how to build the Docker image and push it to ECR to be ready for use
# by SageMaker.

# The argument to this script is the image name. This will be used as the image on the local
# machine and combined with the account and region to form the repository name for ECR.
if [ "$#" -ne 1 ]; then
    echo "usage: $0 [region-name]"
    exit 1
fi

image="all-in-one-ai-gluoncv"

region=$1

# chmod +x train
chmod +x serve

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]
then
    exit 255
fi

if [[ $region =~ ^cn.* ]]
then
    fullname="${account}.dkr.ecr.${region}.amazonaws.com.cn/${image}:latest"
    registry_id="763104351884"
    registry_region="cn-north-1"
    aws_endpoint="amazonaws.com.cn"
else
    fullname="${account}.dkr.ecr.${region}.amazonaws.com/${image}:latest"
    aws_endpoint="amazonaws.com"
    registry_id="763104351884"
    registry_region="us-east-1"
fi

registry_uri="${registry_id}.dkr.ecr.${registry_region}.${aws_endpoint}"

aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.${aws_endpoint}
aws ecr get-login-password --region ${registry_region} | docker login --username AWS --password-stdin ${registry_id}.dkr.ecr.${registry_region}.${aws_endpoint}

# If the repository doesn't exist in ECR, create it.
aws ecr describe-repositories --repository-names "${image}" --region ${region} || aws ecr create-repository --repository-name "${image}" --region ${region}

if [ $? -ne 0 ]
then
    aws ecr create-repository --repository-name "${image}" --region ${region}
fi

aws ecr set-repository-policy \
    --repository-name "${image}" \
    --policy-text "file://ecr-policy.json" \
    --region ${region}

# Build the docker image, tag with full name and then push it to ECR
docker build -t ${image} -f Dockerfile . --build-arg REGISTRY_URI=${registry_uri}

docker tag ${image} ${fullname}
docker push ${fullname}
