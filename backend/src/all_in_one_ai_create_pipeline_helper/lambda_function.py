import boto3
import json
import botocore
import traceback

lambda_client = boto3.client('lambda', config = botocore.config.Config(retries={'max_attempts': 0}, read_timeout=900 ))

def lambda_handler(event, context):
    print(event)

    script_mode = event['script_mode']
    try:
        if(script_mode):
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_deploy',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
            )

            print(response)
            if('FunctionError' in response):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_deploy', response['FunctionError'])
                }

            payload = json.loads(response['Payload'].read().decode('utf-8'))
            print(payload)
            if(payload['statusCode'] == 400):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_deploy', payload['body'])
                }

            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_finalize_pipeline',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
            )
            print(response)
            if('FunctionError' in response):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_finalize_pipeline',response['FunctionError'])
                }
                    
            payload = json.loads(response['Payload'].read().decode('utf-8'))
            print(payload)
        
            return {
                'statusCode': payload['statusCode'],
                'body': payload['body']
            }
        else:
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_model',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
            )
            print(response)
            if('FunctionError' in response):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_model', response['FunctionError'])
                }
            payload = json.loads(response['Payload'].read().decode('utf-8'))
            print(payload)
            if(payload['statusCode'] == 400):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_model', payload['body'])
                }
            
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_endpoint',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
            )
            print(response)
            if('FunctionError' in response):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_endpoint',response['FunctionError'])
                }
            payload = json.loads(response['Payload'].read().decode('utf-8'))
            print(payload)
            if(payload['statusCode'] == 400):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_endpoint', payload['body'])
                }
        
            if(event['pipeline_type'] == '0' or event['pipeline_type'] == '2'):
                print('3')
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_greengrass_component_version',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
                )
                print(response)
                if('FunctionError' in response):
                    return {
                        'statusCode': 400,
                        'body': 'Error: {0} - {1}'.format('all_in_one_ai_greengrass_component_version',response['FunctionError'])
                    }
        
                payload = json.loads(response['Payload'].read().decode('utf-8'))
                print(payload)
                if(payload['statusCode'] == 400):
                    return {
                        'statusCode': 400,
                        'body': 'Error: {0} - {1}'.format('all_in_one_ai_greengrass_component_version', payload['body'])
                    }
                    
                component_version_arn = payload['body']
        
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_greengrass_deployment',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
                )
                print(response)
                if('FunctionError' in response):
                    return {
                        'statusCode': 400,
                        'body': 'Error: {0} - {1}'.format('all_in_one_ai_greengrass_deployment',response['FunctionError'])
                    }
        
                payload = json.loads(response['Payload'].read().decode('utf-8'))
                print(payload)
                if(payload['statusCode'] == 400):
                    return {
                        'statusCode': 400,
                        'body': 'Error: {0} - {1}'.format('all_in_one_ai_greengrass_deployment', payload['body'])
                    }
                    
                deployment_id = payload['body']
                print('123++')
                print(deployment_id)
                
            if(event['pipeline_type'] == '0' or event['pipeline_type'] == '2'):
                event['component_version_arn'] = component_version_arn 
                event['deployment_id'] = deployment_id
        
            response = lambda_client.invoke(
                FunctionName = 'all_in_one_ai_finalize_pipeline',
                InvocationType = 'RequestResponse',
                Payload=json.dumps({'body' : json.dumps(event), 'httpMethod': 'POST'})
            )
            print(response)
            if('FunctionError' in response):
                return {
                    'statusCode': 400,
                    'body': 'Error: {0} - {1}'.format('all_in_one_ai_finalize_pipeline',response['FunctionError'])
                }
                    
            payload = json.loads(response['Payload'].read().decode('utf-8'))
            print(payload)
        
            return {
                'statusCode': payload['statusCode'],
                'body': payload['body']
            }

    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }