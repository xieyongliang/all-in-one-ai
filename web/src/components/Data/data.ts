export const COLORS : string[] = [
    '#ff3838',
    '#ff9d97',
    '#ff701f',
    '#ffb21d',
    '#cff231',
    '#48f90a',
    '#92cc17',
    '#3ddb86',
    '#1a9334',
    '#00d4bb',
    '#2c99a8',
    '#00c2ff',
    '#344593',
    '#6473ff',
    '#0018ec',
    '#8438ff',
    '#520085',
    '#cb38ff',
    '#ff95c8',
    '#ff37c7'
]

export const APIS = {
    'create_training_job': {'function': 'all_in_one_ai_create_training_job_yolov5', 'method': 'POST'},
    'describe_training_job': {'function': 'all_in_one_ai_describe_training_job', 'method': 'GET'},
    'create_transform_job': {'function': 'all_in_one_ai_create_transform_job', 'method': 'POST'},
    'describe_transform_job': {'function': 'all_in_one_ai_describe_transform_job', 'method': 'GET'},
    'create_model': {'function': 'all_in_one_ai_create_model', 'method': 'POST'},
    'describe_model': {'function': 'all_in_one_ai_describe_model', 'method': 'GET'},
    'create_endpoint': {'function': 'all_in_one_ai_create_endpoint', 'method': 'POST'},
    'describe_endpoint': {'function': 'all_in_one_ai_describe_endpoint', 'method': 'GET'},
    'inference': {'function': 'all_in_one_ai_inference', 'method': 'POST'}
}