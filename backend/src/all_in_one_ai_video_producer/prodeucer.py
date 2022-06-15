import websocket
import json
import subprocess
import os
import signal

endpoint_url = os.environ['WEBSOCKET_API']
print(endpoint_url)
ws = websocket.WebSocket()
ws.connect(endpoint_url)
ws.send(json.dumps({"action":"login","camera_id":"001"}))
ws.send(json.dumps({"action":"login","camera_id":"002"}))
ws.send(json.dumps({"action":"login","camera_id":"003"}))
ws.send(json.dumps({"action":"login","camera_id":"004"}))
ws.send(json.dumps({"action":"login","camera_id":"005"}))
ws.send(json.dumps({"action":"login","camera_id":"006"}))
ws.send(json.dumps({"action":"login","camera_id":"007"}))
ws.send(json.dumps({"action":"login","camera_id":"008"}))
ws.send(json.dumps({"action":"login","camera_id":"009"}))
ws.send(json.dumps({"action":"login","camera_id":"010"}))

try:
    while True:
        data = json.loads(ws.recv())
        print(data)
        data = json.loads(data)
        action = data['action']

        if(action == 'start'):
            rtsp_uri = data['rtsp_uri']
            stream_name = data['stream_name']
            args = ['/home/ubuntu/amazon-kinesis-video-streams-producer-sdk-cpp/build/kvs_gstreamer_sample', stream_name, rtsp_uri]
            p = subprocess.Popen(args, cwd='/home/ubuntu/amazon-kinesis-video-streams-producer-sdk-cpp/build')
            process[p] = {'rtsp_uri': rtsp_uri, 'stream_name': stream_name}
        elif(action == 'stop'):
            rtsp_uri = None
            stream_name = None
            if('rtsp_uri' in data):
                rtsp_uri = data['rtsp_uri']
            if('stream_name' in data):
                stream_name = data['stream_name']
            for p in process:
                if(rtsp_uri != None and stream_name != None):
                    if(rtsp_uri == process[p]['rtsp_uri'] and stream_name == process[p]['stream_name']):
                        os.kill(p.pid, signal.SIGTERM)
                elif(rtsp_uri != None):
                    if(rtsp_uri == process[p]['rtsp_uri']):
                        os.kill(p.pid, signal.SIGTERM)
                elif(stream_name != None):
                    if(stream_name == process[p]['stream_name']):
                        os.kill(p.pid, signal.SIGTERM)
                else:
                    pass
        else:
            pass
except KeyboardInterrupt:
  ws.close()