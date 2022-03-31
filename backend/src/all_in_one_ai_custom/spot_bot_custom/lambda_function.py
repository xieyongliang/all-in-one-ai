import cfnresponse
import boto3
import requests
import socket
import datetime
import time
import random
import string

def lambda_handler(event, context):
    print(event)

    responseData = {}

    if event['RequestType'] == 'Delete':
        cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData)
        return

    module = event['ResourceProperties']['Module']
    
    success = True

    if module == 'elasticsearch':
        s3 = boto3.client('s3', config = boto3.session.Config( s3 = {'addressing_style': 'virtual'}, signature_version = 's3v4'))
        s3.download_file(event['ResourceProperties']['S3BUCKET'], event['ResourceProperties']['S3KEY'], '/tmp/export.ndjson')
        url = "{}/api/saved_objects/_import".format(event['ResourceProperties']['ESKibana'])
        file = open('/tmp/export.ndjson','r')
        headers = {'kbn-xsrf': 'true'}
        response = requests.post(url, files = {"file": file}, headers = headers, verify = False)
        print(response)
        ip = socket.gethostbyname(event['ResourceProperties']['ESEndpoint'])
        responseData['ip'] = str(ip)
        print(str(ip))
        print(success)
    elif module == 'dynamodb':
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(event['ResourceProperties']['DynamoTableName'])
        item = {}
        item['bot_name'] = "mtr_bot"
        item['bot_image_cmd'] = ""
        item["bot_mem"] = "6114"
        item["model_s3_path"] = event['ResourceProperties']['ModelDataUrl']
        item["bot_vcpu"] = "6"
        item["endpoint_name"] = event['ResourceProperties']['SageMakerEndpoint']
        item["endpoint_ecr_image_path"] = event['ResourceProperties']['EcrImage']
        item["bot_image"] = event['ResourceProperties']['BotImage']
        item["create_date"] = str(datetime.datetime.utcnow())
        item["file_types"] = [".jpg", ".jpeg", ".png"]
        item["instance_type"] = event['ResourceProperties']['EndpointInstanceType']
        item["update_date"] = str(datetime.datetime.utcnow())
        table.put_item(Item = item)
    elif module == 'cognito':
        region = event['ResourceProperties']['Region']
        client = boto3.client('cloudformation', region)
        StackName = 'spot-bot-cognito-' + ''.join(random.sample(string.ascii_letters + string.digits, 12))
        Domain = event['ResourceProperties']['Domain'] + '-' + ''.join(random.sample(string.ascii_lowercase + string.digits, 6))
        print(Domain)
        response = client.create_stack(
            StackName = StackName,
            TemplateURL = event['ResourceProperties']['TemplateURL'],
            Parameters = [
                {   
                    'ParameterKey': 'CallbackURL',
                    'ParameterValue': event['ResourceProperties']['CallbackURL']
                },        
                {
                    'ParameterKey': 'ClientName',
                    'ParameterValue': event['ResourceProperties']['ClientName']
                },            
                {
                    'ParameterKey': 'Domain',
                    'ParameterValue': Domain
                },            
                {
                    'ParameterKey': 'Email',
                    'ParameterValue': event['ResourceProperties']['Email']
                },            
                {
                    'ParameterKey': 'LogoutURL',
                    'ParameterValue': event['ResourceProperties']['LogoutURL']
                },  
                {
                    'ParameterKey': 'Username',
                    'ParameterValue': event['ResourceProperties']['Username']
                }  
        ])

        print(response)

        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            response = client.describe_stacks(
                StackName = StackName
            )

            while response['Stacks'][0]['StackStatus'] == 'CREATE_IN_PROGRESS':
                time.sleep(2)
                response = client.describe_stacks(
                    StackName = StackName
                )
                print(response)

            success = response['Stacks'][0]['StackStatus'] == 'CREATE_COMPLETE'
            if success:
                outputs = response['Stacks'][0]['Outputs']
                for output in outputs:
                    responseData[output['OutputKey']] = output['OutputValue']
        else:
            success = False
        
    if success:
        status = cfnresponse.SUCCESS
    else:
        status = cfnresponse.FAILED

    print(status)
    print(responseData)

    cfnresponse.send(event, context, status, responseData)
