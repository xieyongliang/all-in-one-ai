#!/bin/bash

if [ $# -lt 2 ]; then
  echo "Usage: $0 <s3_bucket_name> <region> [-a] [funcname1,funcname2,...]"
  exit 1
fi

s3_bucket_name=$1
region=$2
funcnames=""
if [ "$3" == "-a" ]; then
  all_funcs="true"
else
  funcnames=$3
fi

function update_lambda_function {
  local funcname=$1
  local s3_files=$2

  filename="$funcname.zip"
  if ! echo "$s3_files" | grep -q "$filename"; then
    echo "Error: code file for function $funcname not found in S3"
    return
  fi
  aws lambda update-function-code --function-name "$funcname" --s3-bucket "$s3_bucket_name" --s3-key "codes/$filename" --region "$region" > /dev/null
  echo "Updated Lambda function $funcname with code from s3://$s3_bucket_name/codes/$filename"
}

function update_all_lambda_functions {
  local s3_files=$1

  for funcname in $(aws lambda list-functions --query "Functions[].FunctionName" --output text --region "$region"); do
    update_lambda_function "$funcname" "$s3_files"
  done
}

function update_specified_lambda_functions {
  local s3_files=$1
  IFS=',' read -ra funcs <<< "$funcnames"

  for funcname in "${funcs[@]}"; do
    update_lambda_function "$funcname" "$s3_files"
  done
}

function update_modified_lambda_functions {
  local s3_files=$1

  for dir in $(git diff --name-only --diff-filter=AM $project_dir/backend/src | xargs -n1 dirname | sort -u); do
    funcname=$(basename "$dir")
    update_lambda_function "$funcname" "$s3_files"
  done
}

# Get the list of S3 files and cache it
s3_files=$(aws s3 ls "s3://$s3_bucket_name/codes/" --region "$region" | awk '{print $4}')
deploy_dir="$PWD"
project_dir="$deploy_dir/.."

if [ "$all_funcs" == "true" ]; then
  # Update all Lambda functions
  update_all_lambda_functions "$s3_files"
elif [ -n "$funcnames" ]; then
  # Update specified Lambda functions
  update_specified_lambda_functions "$s3_files"
elif ! git diff --quiet --exit-code $project_dir/backend/src; then
  # Changes detected in backend/src, update modified Lambda functions
  update_modified_lambda_functions "$s3_files"
fi
