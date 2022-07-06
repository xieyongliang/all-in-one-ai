import websocket
import json
import subprocess
import os
import signal
import ssl
import time
from pathlib import Path
import traceback

endpoint_url = os.environ['WEBSOCKET_API']
print(endpoint_url)
ws = websocket.WebSocket(sslopt={"cert_reqs": ssl.CERT_NONE})
ws.connect(endpoint_url)
FFM_NUM = 10

source_path = Path(__file__).resolve()
source_dir = source_path.parent

producer_conig = '{0}/producer.config'.format(source_dir)
file1 = open(producer_conig, 'r')
lines = file1.readlines()
for line in lines:
    camera_id = line[0: len(line) - 1]
    ws.send(json.dumps({"action":"login","camera_id":camera_id}))

ffm = []
for i in range(FFM_NUM):
    ffm.append({'id': i, 'status': 'idle'})

process = {}

while True:
    try:
        for p in process:
            rtsp_uri = process[p]['rtsp_uri']
            cmd=[
                'ffprobe', \
                '-v', 'quiet', \
                '-select_streams', 'v:0', \
                '-show_entries', 'stream=codec_name', \
                '-print_format', 'json', \
                rtsp_uri
            ]
            try:
                result = subprocess.check_output(cmd)
            except subprocess.CalledProcessError as e:
                print(e.output)
                ws.send(json.dumps({"action":"monitor","rtsp_uri": rtsp_uri}))

        data = ws.recv()
        print(data)

        if(data == ''):
            ws.connect(endpoint_url)
            continue

        data = json.loads(data)
        print(data)

        action = data['action']

        if(action == 'start'):
            rtsp_uri = data['rtsp_uri']
            stream_name = data['stream_name']

            cmd=[
                'ffprobe', \
                '-v', 'quiet', \
                '-select_streams', 'v:0', \
                '-show_entries', 'stream=codec_name', \
                '-print_format', 'json', \
                rtsp_uri
            ]

            try:
                result = subprocess.check_output(cmd)
                result = json.loads(result.decode("utf-8"))
                codec_name = result['streams'][0]['codec_name']
                kvs_gstreamer_sample = os.environ['kvs_gstreamer_sample'] if 'kvs_gstreamer_sample' in os.environ else '/home/ubuntu/amazon-kinesis-video-streams-producer-sdk-cpp/build/kvs_gstreamer_sample'
                if(codec_name == 'h264'):
                    args = [kvs_gstreamer_sample, stream_name, rtsp_uri]
                    p = subprocess.Popen(args, cwd=kvs_gstreamer_sample[0 : kvs_gstreamer_sample.rfind('/')])
                    process[p] = {'rtsp_uri': rtsp_uri, 'stream_name': stream_name, 'codec_name': codec_name}
                else:
                    dummay_aac = os.environ['dummay_aac'] if 'dummay_aac' in os.environ else '/home/ubuntu/amazon-kinesis-video-streams-producer-sdk-cpp/build/out.m4a'
                    for i in range(FFM_NUM):
                        if(ffm[i]['status'] == 'idle'):
                            ffm[i]['status'] = 'used'
                            ffserver_rtsp_uri = 'rtsp://localhost:8091/rtsp{0}.sdp'.format(i)
                            ffserver_ffm_uri = 'http://localhost:8090/feed{0}.ffm'.format(i)
                            args = ['ffmpeg -i {0} -c:v h264 -i {1} -c:a aac {2}'.format(rtsp_uri, dummay_aac, ffserver_ffm_uri)]
                            p = subprocess.Popen(args, shell=True)
                            time.sleep(5)
                            process[p] = {'rtsp_uri': rtsp_uri, 'stream_name': stream_name, 'codec_name': codec_name, 'ffm_id': i}
                            args = ['gst-launch-1.0 -v rtspsrc location={0} short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name={1} storage-size=128'.format(ffserver_rtsp_uri, stream_name)]
                            p = subprocess.Popen(args, shell=True)
                            process[p] = {'rtsp_uri': rtsp_uri, 'stream_name': stream_name, 'codec_name': codec_name, 'ffm_id': i}
                            break
                        else:
                            pass
            except subprocess.CalledProcessError as e:
                print(e.output)
                ws.send(json.dumps({"action":"monitor","rtsp_uri": rtsp_uri}))

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
                        os.kill(p.pid + 1, signal.SIGTERM)
                        if(process[p]['codec_name'] == 'h264'):
                            os.kill(p.pid, signal.SIGTERM)
                        else:
                            os.kill(p.pid + 1, signal.SIGTERM)
                            ffm_id = process[p]['ffm_id']
                            ffm[ffm_id]['status'] = 'idle'
                elif(rtsp_uri != None):
                    if(rtsp_uri == process[p]['rtsp_uri']):
                        if(process[p]['codec_name'] == 'h264'):
                            os.kill(p.pid, signal.SIGTERM)
                        else:
                            ffm_id = process[p]['ffm_id']
                            ffm[ffm_id]['status'] = 'idle'
                elif(stream_name != None):
                    if(stream_name == process[p]['stream_name']):
                        if(process[p]['codec_name'] == 'h264'):
                            os.kill(p.pid, signal.SIGTERM)
                        else:
                            os.kill(p.pid + 1, signal.SIGTERM)
                            ffm_id = process[p]['ffm_id']
                            ffm[ffm_id]['status'] = 'idle'
                else:
                    pass
        else:
            pass
    except KeyboardInterrupt:
        ws.close()
    except websocket.WebSocketConnectionClosedException as e:
        ws.connect(endpoint_url)
    except Exception as e:
        traceback.print_exc()
        print(e)