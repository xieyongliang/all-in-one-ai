import helper
from boto3.dynamodb.conditions import Key
import traceback

industrial_model_table = 'all_in_one_ai_industrial_model'
ddbh = helper.ddb_helper({'table_name': industrial_model_table})

def lambda_handler(event, context):
    print(event)

    try:
        items = ddbh.scan(FilterExpression=Key('model_algorithm').eq('stable-diffusion-webui'))
        print(items)

        if(len(items[0]) == 0):
            return {
                'statusCode': 200,
                'body': None
            }
        else:
            return {
                'statusCode': 200,
                'body': items[0]['model_id']
            }
    
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
