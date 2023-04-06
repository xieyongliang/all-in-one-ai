#!/bin/bash

function show_usage {
  echo "Usage: $0 [-a] [-b <S3_BUCKET>] [-f <funcname1,funcname2,...>] [-r <REGION>]"
  exit 1
}

REGION=""
UPDATE_ALL="false"
S3_BUCKET=""

while getopts ":ab:f:r:" opt; do
  case ${opt} in
    a)
      UPDATE_ALL="true"
      ;;
    b)
      S3_BUCKET=${OPTARG}
      ;;
    f)
      FUNC_NAMES=${OPTARG}
      ;;
    r)
      REGION=${OPTARG}
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      show_usage
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      show_usage
      ;;
  esac
done
shift $((OPTIND-1))


if [ -z "$REGION" ]; then
  echo "Region is required"
  show_usage
fi

deploy_dir="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
project_dir="$(dirname "$deploy_dir")"

# Trap to remove zip files on exit or any interruption of the script
to_remove_file=()
function cleanup {
  for file in "${to_remove_file[@]}"; do
    #echo "Removing $file" 
    rm -rf "$file"
  done
  exit 1
}
trap cleanup EXIT INT


function update_lambda_function_from_s3 {
  local funcname=$1
  local s3_bucket=$2

  filename="$funcname.zip"
  if ! aws s3 ls "s3://$s3_bucket/codes/$filename" --region "$REGION" > /dev/null 2>&1; then
    echo "Error: code file for function $funcname not found in S3"
    return
  fi
  aws lambda update-function-code --function-name "$funcname" --s3-bucket "$s3_bucket" --s3-key "codes/$filename" --region "$REGION" > /dev/null
  if [ $? -ne 0 ]; then
    echo "Error: failed to update Lambda function $funcname" 
  else
    echo "Updated Lambda function $funcname with code from s3://$s3_bucket/codes/$filename"
  fi
}

function update_lambda_function_from_local_file {
  local funcname=$1

  dir="$project_dir/backend/src/$funcname"
  build_dir=$(mktemp -d)

  cp -r $dir/* $build_dir 
  cd $build_dir

  if [ $funcname == 'all_in_one_ai_helper' ]; then
    if [[ $REGION =~ ^cn.* ]]; then
	pip3 install elasticsearch==7.8.0 -t ${build_dir}/ \
	    -i https://opentuna.cn/pypi/web/simple
    else
	pip3 install elasticsearch==7.8.0 -t ${build_dir}/ 
    fi
  fi

  zip_file="$funcname.zip"
  zip -r $zip_file * > /dev/null
  aws lambda update-function-code --function-name "$funcname" \
                                  --zip-file "fileb://$zip_file" \
				  --region "$REGION" > /dev/null
  if [ $? -ne 0 ]; then
    echo "Error: failed to update Lambda function $funcname using $zip_file" 
  else
    echo "Updated Lambda function $funcname with code from local $zip_file"
  fi
  to_remove_file+=("$build_dir")
}

function update_lambda_from_locally {
  if [ "$UPDATE_ALL" == "true" ]; then
    # Update all Lambda functions using local files
    for funcname in $(aws lambda list-functions --query "Functions[].FunctionName" --output text --region "$REGION"); do
      update_lambda_function_from_local_file "$funcname"
    done
  elif [ -n "$FUNC_NAMES" ]; then
    # Update specified Lambda functions using local files
    IFS=',' read -ra funcs <<< "$FUNC_NAMES"
    for funcname in "${funcs[@]}"; do
      update_lambda_function_from_local_file "$funcname"
    done
  fi
}

function update_lambda_from_s3 {
  # Get the list of S3 files and cache it
  s3_files=$(aws s3 ls "s3://$S3_BUCKET/codes/" --region "$REGION" | awk '{print $4}')
  
  if [ "$UPDATE_ALL" == "true" ]; then
    # Update all Lambda functions using S3 files
    for funcname in $(aws lambda list-functions --query "Functions[].FunctionName" --output text --region "$REGION"); do
      update_lambda_function_from_s3 "$funcname" "$S3_BUCKET"
    done
  elif [ -n "$FUNC_NAMES" ]; then
    # Update specified Lambda functions using S3 files
    IFS=',' read -ra funcs <<< "$FUNC_NAMES"
    for funcname in "${funcs[@]}"; do
      update_lambda_function_from_s3 "$funcname" "$S3_BUCKET"
    done
  fi
}

# Main sccript
if [ -z "$S3_BUCKET" ]; then
  update_lambda_from_locally 
else
  update_lambda_from_s3
fi
