import helper
import traceback
import json
from boto3.dynamodb.conditions import Key

sd_model_table = 'all_in_one_ai_sd_model'
ddbh = helper.ddb_helper({'table_name': sd_model_table})

def lambda_handler(event, context):
    print(event)

    try:
        if event['httpMethod'] == 'POST':
            request = json.loads(event['body'])
            print(request)

            items = request['items']

            for item in items:
                ddbh.put_item(item)
            
            return {
                'statusCode': 200,
                'body': json.dumps(items)
            }
        elif event['httpMethod'] == 'GET':
            endpoint_name = None
            if('endpoint_name' in event['queryStringParameters']):
                endpoint_name = event['queryStringParameters']['s3uri']

            if endpoint_name:
                items = ddbh.scan(FilterExpression=Key('endpoint_name').eq(endpoint_name))
            else:
                items = ddbh.scan()

            print(items)

            return {
                'statusCode': 200,
                'body': json.dumps(items)
            }
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP Method'                
            }
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
