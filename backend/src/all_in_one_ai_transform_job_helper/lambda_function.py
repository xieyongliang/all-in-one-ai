import json
import urllib.parse
import boto3
import uuid
import os
from elasticsearch import Elasticsearch

s3 = boto3.client('s3')
lambda_client = boto3.client('lambda')
endpoint = os.environ['ES_ENDPOINT']
index = os.environ['ES_INDEX']  # = industrial_model
es = Elasticsearch(endpoint)


def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        filename = '/tmp/{0}'.format(str(uuid.uuid4()))
        response = s3.download_file(Bucket=bucket, Key=key, Filename=filename)
        prediction = open(filename, 'r').read()
        print(f"predictions : {prediction}")

        # Save result to OpenSearch specific Index
        # Update document in ES by referring "img_s3uri" with removing last segment of .
        # for example:
        #   output file = s3://test/output/1.jpg.out, index_key = s3://test/output/1.jpg

        matched_doc_id = es.search(index=index,
                                   query={"match": {
                                       "index_key": {
                                           "query": f"s3://{bucket}/{key[key.rfind('.')]}"
                                       }
                                   }})['hits']['hits'][0]["_source"]["_id"]

        response = es.update(
            index=index,
            id=matched_doc_id,
            body={
                "img_vector": prediction,
                "img_s3uri": f"s3://{bucket}/{key}"
            }
        )

        # response = es.index(
        #     index=index,
        #     body={
        #         "img_vector": prediction,
        #         "img_s3uri": f"s3://{bucket}/{key}"
        #     }
        # )

        print(f"Vector inserted into ES: {response}")

    except Exception as e:
        print(e)
        print(
            'Error getting object {} from bucket {}. Make sure they exist and your bucket is in the same region as this function.'.format(
                key, bucket))
        raise e
