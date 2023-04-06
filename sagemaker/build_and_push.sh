#!/bin/bash
if [ "$#" -gt 3 -o "$#" -lt 2 ]; then
    echo "usage: $0 [s3uri] [region] [algorithm]"
    exit 1
fi

s3uri=$1
region=$2
algorithm=$3

sagemaker_dir="$PWD"

if [ ! -z "$algorithm" ]; then
    dirlist=${algorithm}
else
    dirlist=$(find . -mindepth 1 -maxdepth 1 -type d)
fi

echo $dirlist

for subdir in $dirlist
do
    cd ${sagemaker_dir}/${subdir}
    echo ${sagemaker_dir}/${subdir}
    array=($(echo ${subdir} | tr "/" "\n"))
    size=${#array[@]}
    index=$((size - 1))
    algorithm=${array[$index]}
    if [ -f "./build_and_push.sh" ]; 
    then
        ./build_and_push.sh ${region} ${s3uri}
        touch dummy
        tar czvf model.tar.gz dummy
        aws s3 cp model.tar.gz ${s3uri}/algorithms/${algorithm}/artifact/ --region ${region}
        rm dummy
        rm model.tar.gz        
    else
        touch dummy
        tar czvf model.tar.gz dummy
        aws s3 cp model.tar.gz ${s3uri}/algorithms/${algorithm}/artifact/ --region ${region}
        rm dummy
        rm model.tar.gz
        tar czvf sourcedir.tar.gz *
        aws s3 cp sourcedir.tar.gz ${s3uri}/algorithms/${algorithm}/source/ --region ${region}
        rm sourcedir.tar.gz
    fi
done
