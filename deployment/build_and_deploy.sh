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
    if [ -f "./build_and_push.sh" ]; 
    then
        ./build_and_push.sh ${region}
        touch dummy
        tar czvf model.tar.gz dummy
        aws s3 cp model.tar.gz ${s3uri}/algorithms/${algorithm}/artifact/
        rm dummy
        rm model.tar.gz        
    else
        cd ${subdir}
        array=($(echo ${subdir} | tr "/" "\n"))
        size=${#array[@]}
        index=$((size - 1))
        algorithm=${array[$index]}
        touch dummy
        tar czvf model.tar.gz dummy
        aws s3 cp model.tar.gz ${s3uri}/algorithms/${algorithm}/artifact/
        rm dummy
        rm model.tar.gz
        tar czvf sourcedir.tar.gz *
        aws s3 cp sourcedir.tar.gz ${s3uri}/algorithms/${algorithm}/source/
        rm sourcedir.tar.gz
    fi
done
cd ${project_dir}/web
./build_and_push.sh ${region}

cd ${project_dir}/backend && ./build.sh

aws s3 cp ${project_dir}/backend/build/codes ${s3uri}/codes --recursive
aws s3 cp ${project_dir}/deployment/templates ${s3uri}/templates --recursive