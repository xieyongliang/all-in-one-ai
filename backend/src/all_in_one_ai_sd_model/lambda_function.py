import helper
import traceback
import json

sd_model_table = 'all_in_one_ai_sd_model'
ddbh = helper.ddb_helper({'table_name': sd_model_table})

def lambda_handler(event, context):
    print(event)

    try:
        items = ddbh.scan()
        print(items)

        return {
            'statusCode': 200,
            'body': json.dumps(items)
         }
    
    except Exception as e:
        traceback.print_exc()
    
        return {
            'statusCode': 400,
        }
