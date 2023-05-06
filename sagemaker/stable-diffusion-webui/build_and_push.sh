#!/bin/bash

set -v
set -e

# This script shows how to build the Docker image and push it to ECR to be ready for use
# by SageMaker.

if [ "$#" -lt 1 ] || [ "$#" -gt 2]; then
    echo "usage: $0 [region_name] [image_type]"
    exit 1
fi

region="$1"
image_type="$2"

# Get the account number associated with the current IAM credentials
account=$(aws sts get-caller-identity --query Account --output text)
if [ "$?" -ne 0 ]; then
    exit 255
fi

# image_type: training, inference, process, webui
function build_and_push_image() {
    local image_type="$1"

    if [ "$image_type" == "webui" ]; then
	image_name="all-in-one-ai-stable-diffusion-webui"
    else
	image_name="all-in-one-ai-stable-diffusion-webui-$image_type"
    fi
    image_fullname="${account}.dkr.ecr.${region}.amazonaws.com/${image_name}:latest"
    ecr_repo_uri="${account}.dkr.ecr.${region}.amazonaws.com"

    # If the repository doesn't exist in ECR, create it
    aws ecr describe-repositories --repository-names "${image_name}" --region "${region}" || aws ecr create-repository --repository-name "${image_name}" --region "${region}"

    # Get the login command from ECR and execute it directly
    aws ecr get-login-password --region "${region}" | \
	docker login --username AWS --password-stdin "${ecr_repo_uri}"

    aws ecr set-repository-policy \
        --repository-name "${image_name}" \
        --policy-text "file://ecr-policy.json" \
        --region "${region}"

    # Build the docker image locally with the image name and then push it to ECR
    # with the full name.
    docker build -t "${image_name}" -f Dockerfile.${image_type} .
    docker tag "${image_name}" "${image_fullname}"
    docker push "${image_fullname}"
}

if [ -z "${image_type}" ]; then
    # Build all if no image type specified
    build_and_push_image "webui"
    build_and_push_image "training"
    build_and_push_image "inference"
    build_and_push_image "process"
else
    build_and_push_image "${image_type}"
fi
