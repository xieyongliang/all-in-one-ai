import json
import urllib.parse
import boto3
import os
import traceback
from elasticsearch import Elasticsearch

s3_resource = boto3.resource('s3')

endpoint = os.environ['ES_ENDPOINT']
es = Elasticsearch(endpoint)

def lambda_handler(event, context):
    print(event)

    try:
        bucket = event['Records'][0]['s3']['bucket']['name']
        key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
        img_s3uri = 's3://{0}/{1}'.format(bucket, key)

        index = None

        if('ES_INDEX_MAP' in os.environ):
            es_index_map = json.loads(os.environ['ES_INDEX_MAP'])
            for industrial_model in es_index_map:
                s3uri = es_index_map[industrial_model]
                if (img_s3uri.startswith(s3uri)):
                    index = industrial_model
                    break

        obj = s3_resource.Object(bucket, key)
        body = obj.get()['Body'].read().decode('utf-8') 
        prediction = json.loads(body)['result']

        if(index != None):
            response = es.index(
                index = index,
                body = {
                    "img_vector": prediction,
                    "img_s3uri": img_s3uri
                }
            )
            print(response)

    except Exception as e:
        traceback.print_exc()
        raise e
