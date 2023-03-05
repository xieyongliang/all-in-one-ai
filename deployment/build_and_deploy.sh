if [ "$#" -gt 4 -o "$#" -lt 2 ]; then
    echo "usage: $0 [s3uri] [region] [algorithm] [lite or normal], by default lite for stable-diffusion-webui"
    exit 1
fi

s3uri=$1
region=$2
algorithm=$3
option=$4

if [ "${algorithm}" == "stable-diffusion-webui" -a -z "${option}" ]; then
option="lite"
fi

project_dir="$PWD"/..

cd ${project_dir}/backend
./build_and_push.sh ${s3uri} ${region}

cd ${project_dir}/deployment
aws s3 cp templates ${s3uri}/templates --recursive --region ${region}

cd ${project_dir}/sagemaker
if [ "${algorithm}" == "stable-diffusion-webui" -a "${option}" == "lite" ]; then
cp stable-diffusion-webui/build_and_push.sh.lite stable-diffusion-webui/build_and_push.sh
else
cp stable-diffusion-webui/build_and_push.sh.origin stable-diffusion-webui/build_and_push.sh
fi
chmod +x stable-diffusion-webui/build_and_push.sh
./build_and_push.sh ${s3uri} ${region} ${algorithm}

cd ${project_dir}/web
if [ "${algorithm}" == "stable-diffusion-webui" -a "${option}" == "lite" ]; then
cp Dockerfile.lite Dockerfile
else
cp Dockerfile.origin Dockerfile
fi
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
