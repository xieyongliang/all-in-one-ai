#!/bin/bash
set -v
set -e

# This script shows how to build the Docker image and push it to ECR to be ready for use
# by SageMaker.

# The argument to this script is the region name. 

if [ "$#" -ne 1 ] && [ "$#" -ne 2 ]; then
    echo "usage: $0 [region-name] [option]"
    exit 1
fi

region=$1
option=$2

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]
then
    exit 255
fi

if [ -z $option] || [ $option == "inference" ]
then
    inference_image=all-in-one-ai-stable-diffusion-webui-inference
    inference_fullname=${account}.dkr.ecr.${region}.amazonaws.com/${inference_image}:latest

    # If the repository doesn't exist in ECR, create it.
    aws ecr describe-repositories --repository-names "${inference_image}" --region ${region} || aws ecr create-repository --repository-name "${inference_image}" --region ${region}

    if [ $? -ne 0 ]
    then
        aws ecr create-repository --repository-name "${inference_image}" --region ${region}
    fi

    # Get the login command from ECR and execute it directly
    aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $account.dkr.ecr.$region.amazonaws.com

    aws ecr set-repository-policy \
        --repository-name "${inference_image}" \
        --policy-text "file://ecr-policy.json" \
        --region ${region}

    # Build the docker image locally with the image name and then push it to ECR
    # with the full name.

    docker build -t ${inference_image} -f Dockerfile.inference . 

    docker tag ${inference_image} ${inference_fullname}

    docker push ${inference_fullname}
fi

if [ -z $option] || [ $option == "webui" ]
then
    webui_image=all-in-one-ai-stable-diffusion-webui
    webui_fullname=${account}.dkr.ecr.${region}.amazonaws.com/${webui_image}:latest

    # If the repository doesn't exist in ECR, create it.
    aws ecr describe-repositories --repository-names "${webui_image}" --region ${region} || aws ecr create-repository --repository-name "${webui_image}" --region ${region}

    if [ $? -ne 0 ]
    then
        aws ecr create-repository --repository-name "${webui_image}" --region ${region}
    fi

    # Get the login command from ECR and execute it directly
    aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $account.dkr.ecr.$region.amazonaws.com

    aws ecr set-repository-policy \
        --repository-name "${webui_image}" \
        --policy-text "file://ecr-policy.json" \
        --region ${region}

    # Build the docker image locally with the image name and then push it to ECR
    # with the full name.

    docker build -t ${webui_image} -f Dockerfile.webui . 

    docker tag ${webui_image} ${webui_fullname}

    docker push ${webui_fullname}
fi

if [ -z $option] || [ $option == "training" ]
then
    training_image=all-in-one-ai-stable-diffusion-training
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

    docker build -t ${training_image} -f Dockerfile.training . 

    docker tag ${training_image} ${training_fullname}

    docker push ${training_fullname}
fi