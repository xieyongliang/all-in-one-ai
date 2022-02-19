import json
import boto3
import helper
from botocore.exceptions import ClientError

ssmh = helper.ssm_helper()
transformjob_table = ssmh.get_parameter('/all_in_one_ai/config/meta/transformjob_table')
ddbh = helper.ddb_helper({'table_name': transformjob_table})

s3 = boto3.client('s3', config=boto3.session.Config(s3={'addressing_style': 'virtual'}, signature_version='s3v4'))

def lambda_handler(event, context):
    transformjob_name = event['pathParameters']['transformjob_name']
    case_name = event['queryStringParameters']['case']    

    params = {}
    params['transformjob_name'] = transformjob_name
    params['case_name'] = case_name
    item = ddbh.get_item(params)
    
    s3_input_uri = item['s3_input_uri']
    s3_output_uri = item['s3_output_uri']

    input_bucket, input_key = get_bucket_and_key(s3_input_uri)
    output_bucket, output_key = get_bucket_and_key(s3_output_uri)
    
    input = []
    output = []
    
    response = s3.list_objects_v2(
        Bucket = output_bucket,
        Prefix = output_key
    )

    for content in response['Contents']:
        output_filename = content['Key']
        output_filename = output_filename[len(transformjob_name) + 1 : ]
        input_filename = output_filename[0 : output_filename.rfind('.')]
        input.append(get_presigned_url(input_bucket, input_key + '/' + input_filename))
        output.append(get_presigned_url(output_bucket, output_key + '/' + output_filename))
        
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps({"input": input, "output": output})
    }

def get_bucket_and_key(s3uri):
    pos = s3uri.find('/', 5)
    bucket = s3uri[5 : pos]
    key = s3uri[pos + 1 : ]
    return bucket, key
    
def get_presigned_url(bucket, key):
    try:
        url = s3.generate_presigned_url(
          ClientMethod='get_object',
          Params={'Bucket': bucket, 'Key': key}, 
          ExpiresIn=1000
        )
        print("Got presigned URL: {}".format(url))
    except ClientError:
        print("Couldn't get a presigned URL for client method {}.".format(client_method))
        raise
    return url
