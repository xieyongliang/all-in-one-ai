import json
import boto3
import uuid
import datetime
import traceback
import helper
from boto3.dynamodb.conditions import Key

kvs_client = boto3.client('kinesisvideo')
lambda_client = boto3.client('lambda')

video_connection_table = 'all_in_one_ai_video_stream'
ddbh = helper.ddb_helper({'table_name': video_connection_table})

def lambda_handler(event, context):
    print(event['queryStringParameters'])
    if event['httpMethod'] == 'GET':
        try:
            camera_id = event['queryStringParameters']['camera_id']
            action = event['queryStringParameters']['action']
            
            if(action == 'create'):
                stream_name = str(uuid.uuid4())
                if event['queryStringParameters'] !=None and 'stream_name' in event['queryStringParameters']:
                    stream_name = event['queryStringParameters']['stream_name']

                data_retention_in_hours = 24
                if event['queryStringParameters'] !=None and 'data_retention_in_hours' in event['queryStringParameters']:
                    data_retention_in_hours = event['queryStringParameters']['data_retention_in_hours']

                response = kvs_client.create_stream(
                    StreamName = stream_name,
                    DataRetentionInHours = data_retention_in_hours,
                )

                items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))

                if(len(items) > 0):
                    key = {
                        'camera_id' : camera_id,
                        'stream_name': items[0]['stream_name']
                    }
                    ddbh.delete_item(key)
        
                params = {}
                params['camera_id'] = camera_id
                params['stream_name'] = stream_name
                params['stream_arn'] = response['StreamARN']
                ddbh.put_item(params)

                return {
                    'statusCode': 200
                }
            elif(action == 'start'):                
                items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))

                if(len(items) > 0):
                    stream_name = items[0]['stream_name']
                else:
                    return {
                        'statusCode': 400,
                        'body': 'Non-existed camera id'
                    }

                rtsp_uri = event['queryStringParameters']['rtsp_uri']

                payload = {}
                payload['data'] = {
                    'action': 'start',
                    'rtsp_uri': rtsp_uri,
                    'stream_name': stream_name
                }
                payload['camera_id'] = camera_id
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_websocket_command',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body': payload})
                )

                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    if(payload['statusCode'] == 200):
                        return {
                            'statusCode': 200
                        }
                    else:
                        return {
                            'statusCode': 400,
                            'body': payload['body']
                        }
                else:
                    return {
                        'statusCode': 400,
                        'body': payload['body']
                    }
            elif(action == 'query'):
                items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))

                if(len(items) > 0):
                    stream_name = items[0]['stream_name']
                else:
                    return {
                        'statusCode': 400,
                        'body': 'Non-existed camera id'
                    }

                playback_mode = 'LIVE'
                if event['queryStringParameters'] !=None and 'playback_mode' in event['queryStringParameters']:
                    playback_mode = event['queryStringParameters']['playback_mode']

                start_timestamp = None
                if event['queryStringParameters'] !=None and 'start_timestamp' in event['queryStringParameters']:
                    start_timestamp = datetime(event['queryStringParameters']['start_timestamp'])

                end_timestamp = None
                if event['queryStringParameters'] !=None and 'end_timestamp' in event['queryStringParameters']:
                    end_timestamp = datetime(event['queryStringParameters']['end_timestamp'])

                response = kvs_client.get_data_endpoint(StreamName=stream_name, APIName='GET_HLS_STREAMING_SESSION_URL')
                data_endpoint = response['DataEndpoint']
                kvs_archieved_client = boto3.client('kinesis-video-archived-media', endpoint_url=data_endpoint)
                if(playback_mode == 'LIVE'):
                    response = kvs_archieved_client.get_hls_streaming_session_url(
                        StreamName=stream_name,
                        PlaybackMode=playback_mode
                    )
                else:
                    response = kvs_archieved_client.get_hls_streaming_session_url(
                        StreamName=stream_name,
                        PlaybackMode=playback_mode,
                        HLSFragmentSelector={
                            'FragmentSelectorType': 'PRODUCER_TIMESTAMP'|'SERVER_TIMESTAMP',
                            'TimestampRange': {
                                'StartTimestamp': start_timestamp,
                                'EndTimestamp': end_timestamp
                            }
                        }
                    )
                return {
                    'statusCode': 200,
                    'body': response['HLSStreamingSessionURL']
                }
            elif(action == 'stop' or action == 'delete'):
                items = ddbh.scan(FilterExpression=Key('camera_id').eq(camera_id))

                if(len(items) > 0):
                    stream_name = items[0]['stream_name']
                    stream_arn = items[0]['stream_arn']
                else:
                    return {
                        'statusCode': 400,
                        'body': 'Non-existed camera id'
                    }

                payload = {}
                payload['data'] = {
                    'action': 'stop',
                    'stream_name': stream_name
                }
                payload['camera_id'] = camera_id
                response = lambda_client.invoke(
                    FunctionName = 'all_in_one_ai_websocket_command',
                    InvocationType = 'RequestResponse',
                    Payload=json.dumps({'body': payload})
                )
                
                if('FunctionError' not in response):
                    payload = response["Payload"].read().decode("utf-8")
                    payload = json.loads(payload)
                    if(payload['statusCode'] == 200):
                        if(action == 'delete'):
                            params = {}
                            params['camera_id'] = camera_id
                            params['stream_name'] = stream_name
                            ddbh.delete_item(params)
                            
                            response = kvs_client.delete_stream(
                                StreamARN = stream_arn
                            )
                        return {
                            'statusCode': 200
                        }
                    else:
                        return {
                            'statusCode': 400,
                            'body': payload['body']
                        }
                else:
                    return {
                        'statusCode': 400,
                        'body': payload['body']
                    }
            else:
                return {
                    'statusCode': 400,
                    'body': 'Unsupported action'
                }

        except Exception as e:
            traceback.print_exc()
            return {
                'statusCode': 400,
                'body': str(e)
            }

    else:
        return {
            'statusCode': 400,
            'body': 'Unsupported HTTP method'
        }
