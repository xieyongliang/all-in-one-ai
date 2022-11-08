#!/bin/bash
set -v
set -e

# This script shows how to build the Docker image and push it to ECR to be ready for use
# by SageMaker.

# The argument to this script is the region name. 

if [ "$#" -ne 1 ]; then
    echo "usage: $0 [region-name]"
    exit 1
fi

region=$1

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]
then
    exit 255
fi

training_image=all-in-one-ai-wenet-training
training_fullname=${account}.dkr.ecr.${region}.amazonaws.com/${training_image}:latest

# If the repository doesn't exist in ECR, create it.
aws ecr describe-repositories --repository-names "${training_image}" --region ${region} || aws ecr create-repository --repository-name "${training_image}" --region ${region}

if [ $? -ne 0 ]
then
    aws ecr create-repository --repository-name "${training_image}" --region ${region}
fi

# Get the login command from ECR and execute it directly
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $account.dkr.ecr.$region.amazonaws.com

aws ecr set-repository-policy \
    --repository-name "${training_image}" \
    --policy-text "file://ecr-policy.json" \
    --region ${region}

# Build the docker image locally with the image name and then push it to ECR
# with the full name.

# Build the docker image locally with the image name and then push it to ECR
# with the full name.

docker build -t ${training_image} -f Dockerfile.training . 

docker tag ${training_image} ${training_fullname}

docker push ${training_fullname}