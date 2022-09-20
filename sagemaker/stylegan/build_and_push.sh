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


# Get the region defined in the current configuration (default to us-west-2 if none defined)
image='all-in-one-ai-stylegan'


case $region in
        'us-east-1' | 'us-east-2' | 'us-west-1' | 'us-west-2' | 'ap-south-1' | 'ap-northeast-2' | 'ap-northeast-2' | 'ap-southeast-1' | 'ap-southeast-2' | 'ap-northeast-1' | 'ca-central-1' | 'eu-central-1' | 'eu-west-1' | 'eu-west-2' | 'eu-west-3' | 'eu-north-1' | 'sa-east-1')
                registry_uri='763104351884.dkr.ecr.us-east-1.amazonaws.com'
                ;;
        'af-south-1')
                registry_uri='626614931356.dkr.ecr.af-south-1.amazonaws.com'
                ;;
        'ap-east-1')
                registry_uri='871362719292.dkr.ecr.ap-east-1.amazonaws.com'
                ;;
        'ap-northeast-3')
                registry_uri='364406365360.dkr.ecr.ap-northeast-3.amazonaws.com'
                ;;
        'ap-southeast-3')
                registry_uri='907027046896.dkr.ecr.ap-southeast-3.amazonaws.com'
                ;;
        'eu-south-1')
                registry_uri='692866216735.dkr.ecr.eu-south-1.amazonaws.com'
                ;;
        'me-south-1')
                registry_uri='217643126080.dkr.ecr.me-south-1.amazonaws.com'
                ;;
        'cn-north-1' | 'cn-northwest-1')
                registry_uri='727897471807.dkr.ecr.cn-north-1.amazonaws.com.cn'
                ;;

esac

echo $registry_uri

fullname="${account}.dkr.ecr.${region}.amazonaws.com/${image}:latest"

# If the repository doesn't exist in ECR, create it.
aws ecr describe-repositories --repository-names "${image}" --region ${region} || aws ecr create-repository --repository-name "${image}" --region ${region}

if [ $? -ne 0 ]
then
    aws ecr create-repository --repository-name "${image}" --region ${region}
fi

# Get the login command from ECR and execute it directly
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $account.dkr.ecr.$region.amazonaws.com

aws ecr set-repository-policy \
    --repository-name "${image}" \
    --policy-text "file://ecr-policy.json" \
    --region ${region}

# Get the login command from ECR in order to pull down the SageMaker PyTorch image
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $registry_uri

# Build the docker image locally with the image name and then push it to ECR
# with the full name.

docker build -t ${image} . --build-arg REGION=${region} --build-arg REGISTRY_URI=${registry_uri}

docker tag ${image} ${fullname}

docker push ${fullname}
