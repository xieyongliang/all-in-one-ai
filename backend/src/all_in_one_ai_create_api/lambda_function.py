import json
import boto3
import uuid
from decimal import Decimal
from datetime import date, datetime

api_client = boto3.client('apigateway')
lambda_client = boto3.client('lambda')
sts_client = boto3.client('sts')
session = boto3.session.Session()

def lambda_handler(event, context):
    rest_api_id = event['rest_api_id']
    api_path = event['api_path']
    api_stage = event['api_stage']
    api_method = event['api_method']
    api_function = event['api_function']
  
    patchOperations = [
        {"op": "add", "path": "/binaryMediaTypes/image~1png"},
        {"op": "add", "path": "/binaryMediaTypes/image~1jpg"},
        {"op": "add", "path": "/binaryMediaTypes/image~1jpeg"}
    ]

    response = api_client.get_rest_api(
        restApiId = rest_api_id
    )
    
    rest_api_name = response['name']
  
    response = api_client.update_rest_api(
        restApiId = rest_api_id, 
        patchOperations = patchOperations
    )
    
    response = api_client.get_resources(
        restApiId = rest_api_id
    )

    resource_dict = {}
    
    for item in response['items']:
        if(item['path'] == '/'):
            root_id = item['id']
        else:
            parent_id = item['parentId']
            if(parent_id not in resource_dict):
                resource_dict[parent_id] = []
            resource_dict[parent_id].append(item)
    
    parent_id = root_id
    
    paths = api_path.split('/')
    
    for pathPart in paths:
        existed = False
        if(parent_id in resource_dict):
            for item in resource_dict[parent_id]:
                if(item['pathPart'] == pathPart):
                    existed = True
                    parent_id = item['id']
                    break
        if(not existed):
            response = api_client.create_resource(
                restApiId = rest_api_id,
                parentId = parent_id,
                pathPart = pathPart
            )
            parent_id = response['id']
    
    try:
        response = api_client.put_method(
            restApiId = rest_api_id,
            resourceId = parent_id,
            httpMethod = api_method,
            authorizationType = "NONE"
        )
    except Exception as e:
        response = api_client.get_method(
            restApiId = rest_api_id,
            resourceId = parent_id,
            httpMethod = api_method
        )
    
    lambda_version = lambda_client.meta.service_model.api_version
    
    api_data = {
        "REGION" : session.region_name,
        "ACCOUNT_ID" : sts_client.get_caller_identity().get('Account'),
        "API_VERSION" : lambda_version,
        "API_ID": rest_api_id,
        "PATH": api_path,
        "STAGE": api_stage,
        "RESOURCE": api_path,
        "FUNCTION" : api_function
    }
    
    uri = "arn:aws:apigateway:{REGION}:lambda:path/{API_VERSION}/functions/arn:aws:lambda:{REGION}:{ACCOUNT_ID}:function:{FUNCTION}/invocations".format(**api_data)

    response = api_client.put_integration(
        restApiId = rest_api_id,
        resourceId = parent_id,
        httpMethod = api_method,
        type = "AWS_PROXY",
        integrationHttpMethod = api_method,
        uri = uri
    )

    source_arn = "arn:aws:execute-api:{REGION}:{ACCOUNT_ID}:{API_ID}/*/POST/{RESOURCE}".format(**api_data)

    response = lambda_client.add_permission(
        FunctionName = api_function,
        StatementId = uuid.uuid4().hex,
        Action = "lambda:InvokeFunction",
        Principal = "apigateway.amazonaws.com",
        SourceArn = source_arn
    )

    response = api_client.create_deployment(
        restApiId = rest_api_id,
        stageName = api_stage
    )
    
    api_url = 'https://{API_ID}.execute-api.{REGION}.amazonaws.com/{STAGE}/{RESOURCE}'.format(**api_data)
    createdDate = response['createdDate']
    
    response = {
        'api_url': api_url,
        'rest_api_name': rest_api_name,
        'created_date': createdDate
    }
    
    return json.dumps(response, default = defaultencode)
    
def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
