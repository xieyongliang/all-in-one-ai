import json
import boto3
import traceback

ses_client = boto3.client('ses')

def lambda_handler(event, context):
    try:
        print(event)
        
        body = json.loads(event['body'])
        data = {
            'rtsp_uri': body['rtsp_uri']
        }
        
        CHARSET = "UTF-8"
        response = ses_client.send_email(
            Destination={
                "ToAddresses": [
                    "yonglxie@amazon.com",
                ],
            },
            Message={
                "Body": {
                    "Text": {
                        "Charset": CHARSET,
                        "Data": json.dumps(data),
                    }
                },
                "Subject": {
                    "Charset": CHARSET,
                    "Data": "RTSP Failed Email Notification",
                },
            },
            Source="yonglxie@amazon.com",
        )
        
        return {
            'statusCode': 200
        }
    
    except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }