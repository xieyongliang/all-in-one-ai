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
    IFS=', ' read -r -a array <<<  ${subdir}
    size=${#array[@]} 
    algorithm=${array["$($size - 1)"]}
    if [ -f "$build_and_push.sh" ]; 
    then
        ./build_and_push.sh ${region}
        touch dummy
        tar czvf sourcedir.tar.gz dummy
        aws s3 cp sourcedir.tar.gz ${s3uri}/algorithms/source/${subdir}/
        rm dummy
        rm sourcedir.tar.gz
    else
        tar czvf sourcedir.tar.gz *
        aws s3 cp sourcedir.tar.gz ${s3uri}/algorithms/source/${subdir}/
        rm sourcedir.tar.gz
    fi
done
cd ${project_dir}/web
./build_and_push.sh ${region}

cd ${project_dir}/backend && ./build.sh

aws s3 cp ${project_dir}/backend/build/codes ${s3uri}/codes --recursive
aws s3 cp ${project_dir}/deployment/templates ${s3uri}/templates --recursive