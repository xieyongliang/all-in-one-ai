import json
import boto3
import helper
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key

ssmh = helper.ssm_helper()
model_table = ssmh.get_parameter('/all_in_one_ai/config/meta/model_table')
ddbh = helper.ddb_helper({'table_name': model_table})

def lambda_handler(event, context):
    # TODO implement
    
    model_name = None
    if event['pathParameters'] != None:
        model_name = event['pathParameters']['model_name']

    case_name = None
    if event['queryStringParameters'] != None:
        if 'case' in event['queryStringParameters']:
            case_name = event['queryStringParameters']['case']

    model_tag = None
    if event['queryStringParameters'] != None:
        if 'tag' in event['queryStringParameters']:
            model_tag = event['queryStringParameters']['tag']

    if model_name == None:
        if case_name != None and model_tag != None:
            items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name) & Attr('model_tags').contains(model_tag))
            items = ddbh.scan()
        elif case_name != None:
            items = ddbh.scan(FilterExpression=Attr('case_name').eq(case_name))
        elif model_tag != None:
            items = ddbh.scan(FilterExpression=Attr('model_tags').contains(model_tag))
        else:
            items = ddbh.scan()
        body = json.dumps(items)
    else:
        params = {}
        params['model_name'] = model_name
        item = ddbh.get_item(params)

        body = json.dumps(item)
    return {
        'statusCode': 200,
        'body': body
    }