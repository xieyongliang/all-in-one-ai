import json
import traceback
import math

def compare(elem):
    return elem[0]

def length(item):
    return len(item)

def extract_key_values(keywords, content):
    origin_content = content

    candidates_outputs = []

    outputs = []

    start = 0

    while(len(content) > 0):
        candidate_keywords = []
        for keyword in keywords:
            if(content.startswith(keyword)):
                candidate_keywords.append(keyword)
        candidate_keywords.sort(key=length)
        if(len(candidate_keywords) > 0):
            candidates_outputs.append(
                {
                    'keyword': candidate_keywords[0],
                    'start': start
                }
            )
            content = content[len(candidate_keywords[0]) : ]
            start += len(candidate_keywords[0])
        else:
            start += 1
            content = content[1 : ]

    for index in range(0, len(candidates_outputs)):
        key = candidates_outputs[index]['keyword']
        if(index < len(candidates_outputs) - 1):
            value = origin_content[candidates_outputs[index]['start'] + len(candidates_outputs[index]['keyword']) : candidates_outputs[index + 1]['start']]
        else:
            value = origin_content[candidates_outputs[index]['start'] + len(candidates_outputs[index]['keyword']) : ]
        
        if(value.startswith(':') or value.startswith('：')):
            value = value[ 1 : ]

        outputs.append(
            {
                'key': key,
                'value': value
            }
        )

    print(outputs)

    return outputs

def lambda_handler(event, context):
    try:
        print(event)

        payload = event['payload']
        post_process = event['post_process']
        keywords = event['extra']

        results = {}
        outputs = []

        if(post_process == 'ocr_key_value_extraction'):
            first = True
            a = None

            threshold = 5   

            count = len(payload['label'])

            for index in range(0 , count):
                bbox = payload['bbox'][index]
                x1 = int(bbox[0][0])
                y1 = int(bbox[0][1])
                x2 = int(bbox[1][0])
                y2 = int(bbox[1][1])
                x3 = int(bbox[2][0])
                y3 = int(bbox[2][1])
                x4 = int(bbox[3][0])
                y4 = int(bbox[3][1])
                content = payload['label'][index]

                if(first and content != keywords[0]):
                    continue
                elif(first and content == keywords[0]):
                    first = False
                    if(a == None and abs(y1 - y2) > threshold):
                        a = 2 * math.pi - math.atan((y2 - y1) / (x2 - x1))

                if(a != None):
                    x2 = (int)((x2 - x1) * math.cos(a) - (y2 - y1) * math.sin(a) + x1)
                    y2 = (int)((x2 - x1) * math.sin(a) + (y2 - y1) * math.cos(a) + y1)
                    x3 = (int)((x3 - x1) * math.cos(a) - (y3 - y1) * math.sin(a) + x1)
                    y3 = (int)((x3 - x1) * math.sin(a) + (y3 - y1) * math.cos(a) + y1)
                    x4 = (int)((x4 - x1) * math.cos(a) - (y4 - y1) * math.sin(a) + x1)
                    y4 = (int)((x4 - x1) * math.sin(a) + (y4 - y1) * math.cos(a) + y1)

                if(abs(x1 - x4) > threshold or abs(y1 - y2) > threshold or abs(x2 - x3) > threshold or abs(y3 - y4) > threshold):
                    continue

                key = y1
                found = False
                for d in range(-1 * threshold, 1 * threshold):
                    if(key + d in results):
                        key = key + d
                        found = True
                
                if(not found):
                    results[y1] = \
                        [
                            (
                                x1, content
                            )
                        ]
                else:
                    arr = results[key]
                    arr.append( 
                        (
                            x1, content
                        )
                    )  

            for key in results.keys():
                arr = results[key]
                arr.sort(key = compare)

            print(results)

            for key in results:
                result = results[key]
                content = ''
                for item in result:
                    content += item[1]

                sentence_outputs = extract_key_values(keywords = keywords, content = content)

                if(len(sentence_outputs) == 0):
                    outputs.append(
                        {
                            'key': '',
                            'value': content
                        }
                    )
                else:
                    for sentence_output in sentence_outputs:
                        outputs.append(sentence_output)

        print(outputs)
        
        payload['outputs'] = outputs
    
        return {
            'statusCode': 200,
            'body': json.dumps(payload, ensure_ascii = False)
        }
    
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }