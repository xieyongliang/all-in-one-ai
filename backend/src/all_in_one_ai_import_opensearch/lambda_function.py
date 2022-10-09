import json
import os
import boto3
from elasticsearch import Elasticsearch
import traceback

lambda_client = boto3.client('lambda')
s3_client = boto3.resource('s3')


def lambda_handler(event, context):
    print(event)

    try:
        industrial_model = event['queryStringParameters']['industrial_model']
        index = industrial_model
        endpoint = os.environ['ES_ENDPOINT']
        es = Elasticsearch(endpoint)

        _ENDPOINT_INFERENCE = 'endpoint_name' in event['queryStringParameters']

        action = None
        if 'action' in event['queryStringParameters']:
            action = event['queryStringParameters']['action']
        if action == 'query':
            if es.indices.exists(index=index):
                count = es.count(index=index, )['count']
            else:
                count = 0

            if _ENDPOINT_INFERENCE:  # via SQS + Endpoint
                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'current': count
                        }
                    )
                }
            else:  # via Event Notification
                _total_file_count = int(set_or_get_source_file_count_for_transform_job(-1, 'GET'))
                _total_file_count = 1 if _total_file_count == 0 else _total_file_count

                return {
                    'statusCode': 200,
                    'body': json.dumps(
                        {
                            'current': count,
                            'progress': round(count / _total_file_count) * 100
                        }
                    )
                }

        # For Index management (Create, Import)
        create_index(es, index)

        if _ENDPOINT_INFERENCE:  # via SQS
            # for src/components/Forms/ImportImage/index.tsx (call Endpoint for inference)
            endpoint_name = event['queryStringParameters']['endpoint_name']
            model_samples = event['queryStringParameters']['model_samples']

            request = {
                'industrial_model': industrial_model,
                'model_samples': model_samples,
                'endpoint_name': endpoint_name
            }

            response = lambda_client.invoke(
                FunctionName='all_in_one_ai_import_opensearch_handler',
                InvocationType='Event',
                Payload=json.dumps({'body': request})
            )

            return {
                'statusCode': response['StatusCode'],
                'body': response['Payload'].read().decode('utf-8')
            }

        else:  # Event Notification
            total_file_count = get_s3_bucket_file_count(
                retrieve_bucket_and_prefix(get_source_data_s3_bucket_for_transform_job()))
            print(f"Total File Count is {total_file_count}")

            # # Insert to SSM
            set_or_get_source_file_count_for_transform_job(total_file_count)

    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }


def create_index(es, index):
    if es.indices.exists(index=index):
        es.indices.delete(index=index)

    knn_index = {
        "settings": {
            "index.knn": True
        },
        "mappings": {
            "properties": {
                "img_vector": {
                    "type": "knn_vector",
                    "dimension": 2048
                },
                "img_s3uri": {
                    "type": "keyword",
                    "index": "true"
                }
            }
        }
    }

    es.indices.create(index=index, body=knn_index, ignore=400)
    print(es.indices.get(index=index))


def set_or_get_source_file_count_for_transform_job(current_file_count, action=None):
    ssm_client = boto3.client('ssm')

    _param_name = "/all_in_one_ai/config/meta/source_file_count_for_transform_job"

    if action:
        return ssm_client.get_parameter(
            Name=_param_name,
        )['Parameter']['Value']
    else:
        # Update or Create parameter
        try:
            # update
            ssm_client.put_parameter(
                Name=_param_name,
                Value=str(current_file_count),
                Type='String',
                Overwrite=True
            )
        except Exception as ee:
            print(f"Error occurred. {ee}")


def retrieve_bucket_and_prefix(target_s3_bucket_and_prefix):
    """
    Split TARGET_S3_Bucket_and_Prefix to BUCKET & KEY
    """
    _l = (target_s3_bucket_and_prefix if target_s3_bucket_and_prefix.find(":") == -1 else target_s3_bucket_and_prefix[5:]).split("/")

    return _l[0], "/".join(_l[1:])


def get_s3_bucket_file_count(bucket_name_and_prefix):
    """
        Reason for not using "s3.list_object_v2" is the api
        only returns 1000 objects.
    """
    # get the bucket
    bucket = s3_client.Bucket(bucket_name_and_prefix[0])

    # minus FOLDER(-1)
    count_obj = sum(1 for _ in bucket.objects.filter(Prefix=bucket_name_and_prefix[1])) - 1
    print(f"Total count of Target Bucket/Prefix : {count_obj}")

    return count_obj


def get_source_data_s3_bucket_for_transform_job():
    ssm_client = boto3.client('ssm')

    _param_name = "/all_in_one_ai/config/meta/source_data_s3_bucket_for_transform_job"

    try:
        return ssm_client.get_parameter(
            Name=_param_name,
        )['Parameter']['Value']
    except Exception as ee:
        print(f"Error occurred. {ee}")
        return ""
