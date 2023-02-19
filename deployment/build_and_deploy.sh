if [ "$#" -gt 3 -o "$#" -lt 2 ]; then
    echo "usage: $0 [s3uri] [region] [algorithm]"
    exit 1
fi

s3uri=$1
region=$2
algorithm=$3

project_dir="$PWD"/..

cd ${project_dir}/backend
./build_and_push.sh ${s3uri} ${region}

cd ${project_dir}/deployment
aws s3 cp templates ${s3uri}/templates --recursive --region ${region}

cd ${project_dir}/sagemaker
./build_and_push.sh ${s3uri} ${region} ${algorithm}

cd ${project_dir}/web
algorithm2=$(cat src/components/Data/config.json | jq -r .algorithm)
if [ ! -z "${algorithm}" -a ! -z "{$algorithm2}" ]; then
if [ "${algorithm}" != "${algorithm2}" ]; then
tee src/components/Data/config.json << END
{
    "algorithm": "${algorithm}"
}
END
fi
elif [ ! -z "${algorithm}" -a -z "{$algorithm2}" ]; then
tee src/components/Data/config.json << END
{
    "algorithm": "${algorithm}"
}
END
elif [ -z "${algorithm}" -a ! -z "{$algorithm2}" ]; then
tee src/components/Data/config.json << END
{
    "algorithm": ""
}
END
fi
./build_and_push.sh ${region}
