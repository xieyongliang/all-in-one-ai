if [ "$#" -ne 2 ]; then
    echo "usage: $0 [s3uri] [region]"
    exit 1
fi

s3uri=$1
region=$2

project_dir="$PWD"/..

cd ${project_dir}/backend
./build_and_push.sh ${s3uri} ${region}

cd ${project_dir}/deployment
aws s3 cp templates ${s3uri}/templates --recursive --region ${region}

cd ${project_dir}/sagemaker
./build_and_push.sh ${s3uri} ${region}

cd ${project_dir}/web
./build_and_push.sh ${region}
