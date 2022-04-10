if [ "$#" -ne 2 ]; then
    echo "usage: $0 [s3uri] [region]"
    exit 1
fi

s3uri=$1
region=$2

project_dir="$PWD"/..

dirlist=$(find ${project_dir}/sagemaker -mindepth 1 -maxdepth 1 -type d)
for subdir in $dirlist
do
    cd ${subdir}
    ./build_and_push.sh ${region}
done
cd ${project_dir}/web
./build_and_push.sh ${region}

cd ${project_dir}/backend && ./build.sh
cd ${project_dir}
cp -R backend/build/codes/* ${project_dir}/s3/
cp -R deployment/templates ${project_dir}/s3/

aws s3 cp ${project_dir}/s3/* ${s3uri} --recursive