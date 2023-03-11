import json
import boto3
import helper
from boto3.dynamodb.conditions import Key
from decimal import Decimal
from datetime import date, datetime
import traceback

ssmh = helper.ssm_helper()
endpoint_table = ssmh.get_parameter('/all_in_one_ai/config/meta/endpoint_table')
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

ddbh = helper.ddb_helper({'table_name': endpoint_table})

lambda_client = boto3.client('lambda')
asg_client = boto3.client("application-autoscaling")

def lambda_handler(event, context):
    print(event)

    action = None
    if event['queryStringParameters'] !=None and 'action' in event['queryStringParameters']:
        action = event['queryStringParameters']['action']
    
    if event['httpMethod'] == 'POST':
        try:
            request = json.loads(event['body'])
            print(request)

            if action == 'asg':
                endpoint_name = event['pathParameters']['endpoint_name']
                min_capacity = int(request['asg_min_capacity'])
                max_capacity = int(request['asg_max_capacity'])
                target_value = float(request['asg_target_value'])
                scale_in_cooldown = int(request['asg_scale_in_cooldown'])
                scale_out_cooldown = int(request['asg_scale_out_cooldown'])
                response = sagemaker_endpoint_asg_put_asg_policy(endpoint_name, min_capacity, max_capacity, target_value, scale_in_cooldown, scale_out_cooldown)
                
                if isinstance(response, bool):
                    return {
                        'statusCode': 200,
                        'body': ''
                    }
                else:
                    return {
                        'statusCode': 200,
                        'body': str(response)                   
                    }
            else:
                industrial_model = request['industrial_model']
                payload = {}
                payload['endpoint_name'] = request['endpoint_name']
                if('endpoint_config_name' in request):
                    payload['endpoint_config_name'] = request['endpoint_config_name']
                payload['model_name'] = request['model_name']
                payload['instance_type'] = request['instance_type']
                payload['initial_instance_count'] = int(request['initial_instance_count'])
                payload['initial_variant_weight'] = request['initial_variant_weight']
                if('tags' in request):
                    payload['tags'] = request['tags']

                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_create_endpoint',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body' : payload})
                )

                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    if(payload['statusCode'] == 200):
                        params = {}
                        params['endpoint_name'] = request['endpoint_name']
                        params['industrial_model'] = industrial_model
                        ddbh.put_item(params)
                    return {
                        'statusCode': payload['statusCode'],
                        'body': json.dumps(payload['body'])
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
    
    else: 
        endpoint_name = None
        if event['pathParameters'] != None and 'endpoint_name' in event['pathParameters']:
                endpoint_name = event['pathParameters']['endpoint_name']
    
        industrial_model = None
        if event['queryStringParameters'] !=None and 'industrial_model' in event['queryStringParameters']:
                industrial_model = event['queryStringParameters']['industrial_model']
                
        try:
            print(endpoint_name)
            print(industrial_model)
            print(action)
            
            if(action == 'attach' and event['httpMethod'] == 'GET'):
                params = {}
                params['endpoint_name'] = endpoint_name
                params['industrial_model'] = industrial_model
                ddbh.put_item(params)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(params)
                }
            elif (action == 'detach' and event['httpMethod'] == 'GET'):
                key = {
                    'endpoint_name': endpoint_name,
                    'industrial_model': industrial_model
                }
                ddbh.delete_item(key)
                
                return {
                    'statusCode': 200,
                    'body': json.dumps(key)
                }
            elif (action == 'list' and event['httpMethod'] == 'GET'):
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_list_endpoints',
                    InvocationType = 'RequestResponse',
                    Payload=''
                )
            
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    
                    return {
                        'statusCode': payload['statusCode'],
                        'body': payload['body']
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': response['FunctionError']
                    }
            elif (action == 'asg' and event['httpMethod'] == 'GET'):
                response = sagemaker_endpoint_asg_describe_asg_policy(endpoint_name)
                print(response)
                if type(response) is tuple:
                    body = {
                        'asg_min_capacity': response[0],
                        'asg_max_capacity': response[1],
                        'asg_target_value': response[2],
                        'asg_scale_in_cooldown': response[3],
                        'asg_scale_out_cooldown': response[4]
                    }
                    return {
                        'statusCode': 200,
                        'body': json.dumps(body)
                    }
                else:
                    return {
                        'statusCode': 400,
                        'body': json.dumps(response)
                    }
            else:
                if endpoint_name == None:
                    if industrial_model != None:
                        items = ddbh.scan(FilterExpression=Key('industrial_model').eq(industrial_model))
                    else:
                        items = ddbh.scan()
                else:
                    items = [{'endpoint_name': endpoint_name}]                

                result = []
                for item in items:
                    if (event['httpMethod'] == 'DELETE'):
                        if(process_delete_item(item)):
                            try:
                                key = {
                                    'endpoint_name': item['endpoint_name'],
                                    'industrial_model': industrial_model
                                }
                                ddbh.delete_item(key = key)
                            except Exception as e:
                                print(e)
                        result.append(item)
                    else:
                        if(process_get_item(item)):
                            result.append(item)
            
                return {
                    'statusCode': 200,
                    'body': json.dumps(result, default = defaultencode)
                }

        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }
            
def process_get_item(item):
    payload = {'endpoint_name': item['endpoint_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_describe_endpoint',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body' : payload})
    )

    if('FunctionError' not in response):
        payload = response["Payload"].read().decode("utf-8")
        payload = json.loads(payload)

        if(payload['statusCode'] == 200):
            payload = json.loads(payload['body'])
            item.clear()
            item.update(payload)
            return True
        else:
            print(payload['body'])
            return False
    else:
        print(response['FunctionError'])
        return False

def process_delete_item(item):
    payload = {'endpoint_name': item['endpoint_name']}
    response = lambda_client.invoke(
        FunctionName = 'all_in_one_ai_delete_endpoint',
        InvocationType = 'RequestResponse',
        Payload=json.dumps({'body': payload})
    )

    if('FunctionError' not in response):
        payload = response["Payload"].read().decode("utf-8")
        payload = json.loads(payload)
        if(payload['statusCode'] == 200):
            return True
        else:
            print(payload['body'])
            return False
    else:
        print(response['FunctionError'])
        return False

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")

def sagemaker_endpoint_asg_put_asg_policy(endpoint_name, min_capcity = 1, max_capcity = 2, target_value = 5, scale_in_cooldown = 600, scale_out_cooldown = 300):
    try:
        resource_id = f"endpoint/{endpoint_name}/variant/AllTraffic"
        print(resource_id)
        response = asg_client.register_scalable_target(
            ServiceNamespace="sagemaker",
            ResourceId=resource_id,
            ScalableDimension="sagemaker:variant:DesiredInstanceCount",
            MinCapacity=min_capcity,
            MaxCapacity=max_capcity,
        )
        print('register_scalable_target', response)

        response = asg_client.put_scaling_policy(
            PolicyName=f'Request-ScalingPolicy-{endpoint_name}',
            ServiceNamespace="sagemaker",
            ResourceId=resource_id,
            ScalableDimension="sagemaker:variant:DesiredInstanceCount",
            PolicyType="TargetTrackingScaling",
            TargetTrackingScalingPolicyConfiguration={
                "TargetValue": target_value,
                "CustomizedMetricSpecification": {
                    "MetricName": "ApproximateBacklogSizePerInstance",
                    "Namespace": "AWS/SageMaker",
                    "Dimensions": [{"Name": "EndpointName", "Value": endpoint_name}],
                    "Statistic": "Average",
                },
                "ScaleInCooldown": scale_in_cooldown, # duration until scale in begins (down to zero)
                "ScaleOutCooldown": scale_out_cooldown # duration between scale out attempts
            },
        )
        print('put_scaling_policy', response)

        return True

    except Exception as e:
        traceback.print_exc()
        return str(e)

def sagemaker_endpoint_asg_describe_asg_policy(endpoint_name):
    try:
        resource_id = f"endpoint/{endpoint_name}/variant/AllTraffic"
        print(resource_id)
        response = asg_client.describe_scalable_targets(
            ServiceNamespace="sagemaker",
            ResourceIds=[resource_id],
            ScalableDimension="sagemaker:variant:DesiredInstanceCount"
        )
        print(response)
        if len(response['ScalableTargets']) > 0 :
            min_capacity = response['ScalableTargets'][0]['MinCapacity']
            max_capcity = response['ScalableTargets'][0]['MaxCapacity']
            response = asg_client.describe_scaling_policies(
                PolicyNames=[f'Request-ScalingPolicy-{endpoint_name}'],
                ServiceNamespace="sagemaker",
                ResourceId=resource_id,
                ScalableDimension="sagemaker:variant:DesiredInstanceCount",
            )
            print(response)
            found = False
            for scaling_policy in response['ScalingPolicies']:
                if scaling_policy['TargetTrackingScalingPolicyConfiguration']['CustomizedMetricSpecification']['MetricName'] == 'ApproximateBacklogSizePerInstance':
                    target_value = response['ScalingPolicies'][0]['TargetTrackingScalingPolicyConfiguration']['TargetValue']
                    scale_out_cooldown = response['ScalingPolicies'][0]['TargetTrackingScalingPolicyConfiguration']['ScaleOutCooldown']
                    scale_in_cooldown = response['ScalingPolicies'][0]['TargetTrackingScalingPolicyConfiguration']['ScaleInCooldown']
                    found = True
                    break
            if found:
                return min_capacity, max_capcity, target_value, scale_in_cooldown, scale_out_cooldown
            else:
                return 'ScalingPolicy with MetricName is not found'
        else:
            return 'ScalableTargets is empty'

    except Exception as e:
        traceback.print_exc()
        return str(e)
