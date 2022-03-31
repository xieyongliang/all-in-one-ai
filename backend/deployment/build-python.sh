#!/bin/bash
set -v
set -e
#
# This script should be run from the repo's deployment directory
#
#
# Get reference for all important folders
template_dir="$PWD"
build_dist_dir="$template_dir/s3-assets-code"
source_dir="$template_dir/../src"
build_dir="$template_dir/../build"

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

cp -R *.py ${build_dir}/python/
cd ${build_dir}
zip -r9 all_in_one_ai_sagemaker.zip python
cp ${build_dir}/all_in_one_ai_sagemaker.zip $build_dist_dir/all_in_one_ai_sagemaker.zip
rm ${build_dir}/all_in_one_ai_sagemaker.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] all_in_one_ai_create_pipeline lambda functions"
echo "------------------------------------------------------------------------------"

echo ${source_dir}
cd ${source_dir}/all_in_one_ai_create_pipeline
rm -r ${build_dir}

mkdir -p ${build_dir}/python/

if [[ $region =~ ^cn.* ]]
then
    pip3 install sagemaker -t ${build_dir}/python/ -i https://opentuna.cn/pypi/web/simple
else
    pip3 install sagemaker -t ${build_dir}/python/
fi

cp -R *.py ${build_dir}/python/
cd ${build_dir}
zip -r9 all_in_one_ai_create_pipeline.zip python
cp ${build_dir}/all_in_one_ai_create_pipeline.zip $build_dist_dir/all_in_one_ai_create_pipeline.zip
rm ${build_dir}/all_in_one_ai_create_pipeline.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] all_in_one_ai_custom lambda functions"
echo "------------------------------------------------------------------------------"

# build and copy console distribution files
echo ${source_dir}
cd ${source_dir}/all_in_one_ai_custom
echo ${build_dir}
rm -r ${build_dir}

mkdir -p ${build_dir}/
cp -R *.py ${build_dir}/
pip3 install cfnresponse -t ${build_dir}/
pip3 install requests -t ${build_dir}/
cd ${build_dir}
zip -r9 all_in_one_ai_custom.zip .
cp ${build_dir}/all_in_one_ai_custom.zip $build_dist_dir/all_in_one_ai_custom.zip
rm ${build_dir}/all_in_one_ai_custom.zip

echo "------------------------------------------------------------------------------"
echo "[Rebuild] other all_in_one_ai_* lambda functions"
echo "------------------------------------------------------------------------------"

lambda_foldes="
all_in_one_ai_create_api
all_in_one_ai_create_endpoint
all_in_one_ai_create_model
all_in_one_ai_create_pipeline_helper
all_in_one_ai_create_training_job_yolov5
all_in_one_ai_create_transform_job
all_in_one_ai_custom
all_in_one_ai_delete_endpoint
all_in_one_ai_delete_model
all_in_one_ai_describe_endpoint
all_in_one_ai_describe_model
all_in_one_ai_describe_pipeline_execution
all_in_one_ai_describe_training_job
all_in_one_ai_describe_transform_job
all_in_one_ai_function
all_in_one_ai_get_function_code
all_in_one_ai_get_function_console
all_in_one_ai_greengrass_coredevices
all_in_one_ai_greengrass_create_component_version
all_in_one_ai_greengrass_create_deployment
all_in_one_ai_greengrass_thingroups
all_in_one_ai_import_opensearch_handler
all_in_one_ai_inference
all_in_one_ai_invoke_endpoint
all_in_one_ai_model_package_group
all_in_one_ai_s3
all_in_one_ai_transform_job_review
all_in_one_ai_wait_endpoint_in_service"

for lambda_folder in $lambda_foldes; do
    # build and copy console distribution files
    echo ${source_dir}
    cd ${source_dir}/${lambda_folder}
    echo ${build_dir}
    rm -r ${build_dir}

    mkdir -p ${build_dir}/
    cp -R *.py ${build_dir}/
    cd ${build_dir}
    zip -r9 ${lambda_folder}.zip .
    cp ${build_dir}/${lambda_folder}.zip $build_dist_dir/${lambda_folder}.zip
    rm ${build_dir}/${lambda_folder}.zip
done

lambda_foldes="
all_in_one_ai_api
all_in_one_ai_endpoint
all_in_one_ai_finalize_pipeline
all_in_one_ai_greengrass_component_version
all_in_one_ai_greengrass_deployment
all_in_one_ai_import_opensearch
all_in_one_ai_industrial_model
all_in_one_ai_model
all_in_one_ai_model_package
all_in_one_ai_pipeline
all_in_one_ai_search_by_image
all_in_one_ai_training_job
all_in_one_ai_transform_job"

for lambda_folder in $lambda_foldes; do
    # build and copy console distribution files
    echo ${source_dir}
    cd ${source_dir}/${lambda_folder}
    echo ${build_dir}
    rm -r ${build_dir}

    mkdir -p ${build_dir}/
    cp -R *.py ${build_dir}/
    cd ${build_dir}
    zip -r9 ${lambda_folder}.zip .
    cp ${build_dir}/${lambda_folder}.zip $build_dist_dir/${lambda_folder}.zip
    rm ${build_dir}/${lambda_folder}.zip
done