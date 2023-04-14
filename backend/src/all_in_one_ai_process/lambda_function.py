import boto3
import datetime
import json
import sagemaker
from sagemaker.processing import ScriptProcessor, ProcessingInput, ProcessingOutput
import traceback
import helper

ssmh = helper.ssm_helper()
role_arn = ssmh.get_parameter('/all_in_one_ai/config/meta/sagemaker_role_arn')

sagemaker_client = boto3.client('sagemaker')
sagemaker_session = sagemaker.Session()

def lambda_handler(event, context):
    print(event)

    try:
        if event['httpMethod'] == 'POST':
            return setup_process_job(event, context)
        elif event['httpMethod'] == 'GET': 
            return get_process_job_status(event, context)
        else:
            return {
                'statusCode': 400,
                'body': 'Unsupported HTTP method'
            }
    except Exception as e:
        traceback.print_exc()
        return {
            'statusCode': 400,
            'body': str(e)
        }

def setup_process_job(event, context):
    ''' Note: we keep making this API agnostic of 
        what concret processing job is exactly doing, so we can
        make it suitable for being a generic processing job API.
        Please keep in mind no brining processing-job specific details
    '''
    request = json.loads(event['body'])

    image_uri = ssmh.get_parameter('/all_in_one_ai/config/meta/algorithms/stable-diffusion-webui/process_image')
    instance_type = request['instance_type']
    instance_count = int(request['instance_count'])
    code = 'processor/' + request['process_script']
    job_name = request['job_name'] 

    # Handle inputs, there might be multiple inputs
    inputs = []
    input_sources = request['input_sources'] # s3 uri
    input_dests = request['input_destination'] # local path like '/opt/ml/processing/input'
    if len(input_sources.split(',')) != len(input_dests.split(',')):
        raise ValueError("input_sources and input_destination don't match up")

    for in_src, in_dst in zip(input_sources.split(','), input_dests.split(',')):
        inputs.append(ProcessingInput(source=in_src, destination=in_dst))

    # Handle outputs, there might be multiple outputs
    outputs = []
    output_source = request['output_sources'] # local path like '/opt/ml/processing/output'
    output_dest = request['output_destination'] # s3 uri
    output_name = request['output_name']
    for out_src in output_source.split(','):
        outputs.append(ProcessingOutput(source=out_src, destination=output_dest,
                                        output_name=output_name))

    # Handle processing-job specific arguments, just pass them, don't
    # try to peek into them.
    arguments = []
    for arg, val in request['arguments'].items():
        arguments.append(f"--{arg}")
        arguments.append(val if isinstance(val, str) else str(val))

    print(f'==inputs==\n{inputs}')
    print(f'==outputs==\n{outputs}')
    print(f'==arguments==\n{arguments}')
    
    script_processor = ScriptProcessor(command=['python3'],
                image_uri=image_uri,
                role=role_arn,
                instance_count=instance_count,
                instance_type=instance_type)

    script_processor.run(
        job_name=job_name,
        code=code,
        inputs=inputs,
        outputs=outputs,
        arguments=arguments,
        wait=False)
   
    ret = {
        'job_name': job_name
    }

    return {
        'statusCode': 200,
        'body': json.dumps(ret, default = defaultencode)
    }

def get_process_job_status(event, context):
    request = json.loads(event['body'])

    job_name = request['job_name']

    response = sagemaker_client.describe_processing_job(ProcessingJobName=job_name)
    job_status = response['ProcessingJobStatus']
    exit_message = response.get('ExitMessage', '')
    failure_reason = response.get('FailureReason', '')
    ret = {
        'job_status': job_status,
        'exit_message': exit_message,
        'failure_reason': failure_reason
    }

    return {
        'statusCode': 200,
        'body': json.dumps(ret, default = defaultencode)
    }

def defaultencode(o):
    if isinstance(o, Decimal):
        return int(o)
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    raise TypeError(repr(o) + " is not JSON serializable")
