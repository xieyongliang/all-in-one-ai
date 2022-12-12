#!/bin/bash
set -v
set -e
#

# This script should be run from the repo's backend directory
#
#
# Get s3uri and region from command line
s3uri=$1
region=$2

# Get reference for all important folders
backend_dir="$PWD"
project_dir="$backend_dir/.."
build_dist_dir="$backend_dir/build/codes"
source_dir="$backend_dir/src"
build_dir="$backend_dir/build/tmp"

echo "------------------------------------------------------------------------------"
echo "[Init] Clean old dist, node_modules and bower_components folders"
echo "------------------------------------------------------------------------------"
echo "rm -rf $build_dist_dir"
rm -rf $build_dist_dir
echo "mkdir -p $build_dist_dir"
mkdir -p $build_dist_dir

mkdir -p ${build_dir}/

echo "------------------------------------------------------------------------------"
echo "[Rebuild] all_in_one_ai_helper lambda functions"
echo "------------------------------------------------------------------------------"

echo ${source_dir}
cd ${source_dir}/all_in_one_ai_helper
rm -r ${build_dir}

mkdir -p ${build_dir}/python/

if [[ $region =~ ^cn.* ]]
then
    pip3 install elasticsearch==7.8.0 -t ${build_dir}/python/ -i https://opentuna.cn/pypi/web/simple
else
    pip3 install elasticsearch==7.8.0 -t ${build_dir}/python/
fi

cp -R *.py ${build_dir}/python/
cd ${build_dir}
zip -r9 all_in_one_ai_helper.zip python
cp ${build_dir}/all_in_one_ai_helper.zip $build_dist_dir/all_in_one_ai_helper.zip
rm ${build_dir}/all_in_one_ai_helper.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] all_in_one_ai_sagemaker lambda functions"
echo "------------------------------------------------------------------------------"

echo ${source_dir}
cd ${source_dir}/all_in_one_ai_sagemaker
rm -r ${build_dir}

mkdir -p ${build_dir}/python/

cp -R * ${build_dir}/python/
cd ${build_dir}
zip -r9 all_in_one_ai_sagemaker.zip python
cp ${build_dir}/all_in_one_ai_sagemaker.zip $build_dist_dir/all_in_one_ai_sagemaker.zip
rm ${build_dir}/all_in_one_ai_sagemaker.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] all_in_one_ai_tools lambda functions"
echo "------------------------------------------------------------------------------"

cp ${source_dir}/all_in_one_ai_tools/all_in_one_ai_tools.zip $build_dist_dir/all_in_one_ai_tools.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] other all_in_one_ai_list_* lambda functions"
echo "------------------------------------------------------------------------------"

lambda_foldes="
all_in_one_ai_list_endpoints
all_in_one_ai_list_models
all_in_one_ai_list_training_jobs
all_in_one_ai_list_transform_jobs
"

for lambda_folder in $lambda_foldes; do
    # build and copy console distribution files
    echo ${source_dir}
    cd ${source_dir}/${lambda_folder}
    echo ${build_dir}
    rm -r ${build_dir}

    mkdir -p ${build_dir}/
    cp -R * ${build_dir}/
    pip3 install cachetools -t ${build_dir}/
    cd ${build_dir}
    zip -r9 ${lambda_folder}.zip .
    cp ${build_dir}/${lambda_folder}.zip $build_dist_dir/${lambda_folder}.zip
    rm ${build_dir}/${lambda_folder}.zip
done

echo "------------------------------------------------------------------------------"
echo "[Rebuild] other all_in_one_ai_* lambda functions"
echo "------------------------------------------------------------------------------"


lambda_foldes="
all_in_one_ai_add_permission
all_in_one_ai_annotation
all_in_one_ai_api
all_in_one_ai_create_api
all_in_one_ai_create_deploy_generic
all_in_one_ai_create_deploy_huggingface
all_in_one_ai_create_deploy_pytorch
all_in_one_ai_create_deploy_mxnet
all_in_one_ai_create_deploy_tensorflow
all_in_one_ai_create_endpoint
all_in_one_ai_create_model
all_in_one_ai_create_pipeline
all_in_one_ai_create_pipeline_helper
all_in_one_ai_create_s3_event_notification
all_in_one_ai_create_train_generic
all_in_one_ai_create_train_huggingface
all_in_one_ai_create_train_pytorch
all_in_one_ai_create_train_mxnet
all_in_one_ai_create_train_tensorflow
all_in_one_ai_create_training_job
all_in_one_ai_create_transform_job
all_in_one_ai_delete_endpoint
all_in_one_ai_delete_model
all_in_one_ai_delete_s3_event_notification
all_in_one_ai_deploy
all_in_one_ai_describe_endpoint
all_in_one_ai_describe_model
all_in_one_ai_describe_pipeline_execution
all_in_one_ai_describe_training_job
all_in_one_ai_describe_transform_job
all_in_one_ai_endpoint
all_in_one_ai_finalize_pipeline
all_in_one_ai_function
all_in_one_ai_greengrass_component_version
all_in_one_ai_greengrass_core_devices
all_in_one_ai_greengrass_create_component_version
all_in_one_ai_greengrass_create_deployment
all_in_one_ai_greengrass_deployment
all_in_one_ai_greengrass_thing_groups
all_in_one_ai_import_opensearch
all_in_one_ai_import_opensearch_async
all_in_one_ai_import_opensearch_sync
all_in_one_ai_import_opensearch_async_helper
all_in_one_ai_import_opensearch_sync_helper
all_in_one_ai_industrial_model
all_in_one_ai_inference
all_in_one_ai_inference_post_process
all_in_one_ai_invoke_endpoint
all_in_one_ai_model
all_in_one_ai_model_package
all_in_one_ai_model_package_group
all_in_one_ai_pipeline
all_in_one_ai_remove_permission
all_in_one_ai_s3
all_in_one_ai_sd_industrial_model
all_in_one_ai_sd_model
all_in_one_ai_sd_user
all_in_one_ai_search_by_image
all_in_one_ai_stop_training_job
all_in_one_ai_stop_transform_job
all_in_one_ai_train
all_in_one_ai_training_job
all_in_one_ai_transform_job
all_in_one_ai_transform_job_review
all_in_one_ai_websocket_connect
all_in_one_ai_websocket_disconnect
all_in_one_ai_websocket_send_message"

for lambda_folder in $lambda_foldes; do
    # build and copy console distribution files
    echo ${source_dir}
    cd ${source_dir}/${lambda_folder}
    echo ${build_dir}
    rm -r ${build_dir}

    mkdir -p ${build_dir}/
    cp -R * ${build_dir}/
    cd ${build_dir}
    zip -r9 ${lambda_folder}.zip .
    cp ${build_dir}/${lambda_folder}.zip $build_dist_dir/${lambda_folder}.zip
    rm ${build_dir}/${lambda_folder}.zip
done

aws s3 cp ${project_dir}/backend/build/codes ${s3uri}/codes --recursive --region ${region}
aws s3 cp ${project_dir}/backend/assets/greengrass  ${s3uri}/algorithms/yolov5/greengrass/ --recursive --region ${region}
