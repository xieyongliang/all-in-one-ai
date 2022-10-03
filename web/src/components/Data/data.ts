import { SelectOption } from "aws-northstar/components/Select";

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
    'create_training_job': {'function': 'all_in_one_ai_create_training_job', 'method': 'POST'},
    'describe_training_job': {'function': 'all_in_one_ai_describe_training_job', 'method': 'GET'},
    'create_transform_job': {'function': 'all_in_one_ai_create_transform_job', 'method': 'POST'},
    'describe_transform_job': {'function': 'all_in_one_ai_describe_transform_job', 'method': 'GET'},
    'create_model': {'function': 'all_in_one_ai_create_model', 'method': 'POST'},
    'describe_model': {'function': 'all_in_one_ai_describe_model', 'method': 'GET'},
    'create_endpoint': {'function': 'all_in_one_ai_create_endpoint', 'method': 'POST'},
    'describe_endpoint': {'function': 'all_in_one_ai_describe_endpoint', 'method': 'GET'},
    'inference': {'function': 'all_in_one_ai_inference', 'method': 'POST'}
}

export const ALGORITHMS = [
    {label: 'Yolov5', value: 'yolov5', reference: 'https://github.com/ultralytics/yolov5/blob/master/README.md', type: 'single', trainable: true, batchannotation: true}, 
    {label: 'GluonCV', value:'gluoncv', reference: 'https://github.com/dmlc/gluon-cv/blob/master/README.md', type: 'single', trainable: true, batchannotation: false}, 
    {label: 'GluonTS', value:'gluonts', reference: 'https://github.com/awslabs/gluonts/blob/dev/README.md', type: 'single', trainable: true, batchannotation: false},
    {label: 'PaddleOCR', value: 'paddleocr', reference: 'https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.6/README.md',type: 'single', trainable: true, batchannotation: false}, 
    {label: 'CPT', value: 'cpt', reference:'https://github.com/fastnlp/CPT/blob/master/README.md', type: 'single', trainable: true, batchannotation: false}, 
    {label: 'GABSA', value: 'gabsa', reference: 'https://github.com/IsakZhang/Generative-ABSA/blob/main/readme.md', type: 'single', trainable: true, batchannotation: false},
    {label: 'PaddleNLP', value: 'paddlenlp', reference: 'https://github.com/PaddlePaddle/PaddleNLP/blob/develop/README_en.md', type: 'single', trainable: true, batchannotation: false},
    {label: 'mDeBERTa', value: 'mdeberta', reference: 'https://github.com/microsoft/DeBERTa/blob/master/README.md', type: 'single', trainable: false, batchannotation: false},
    {label: 'KeyBERT', value: 'keybert', reference: 'https://github.com/MaartenGr/KeyBERT/blob/master/README.md',  type: 'single', trainable: false, batchannotation: false},
    {label: 'Generic', value: 'generic', reference: 'https://github.com/xieyongliang/all-in-one-ai/blob/main/docs/README.md',  type: 'single', trainable: true, batchannotation: true},
    {label: 'Yolov5PaddleOCR', value: 'yolov5paddleocr', type: 'mixed'}
]

export const TRAININGINPUTDATA = {
    'yolov5': [
        {
            key: 'images',
            value: ''
        },
        {
            key: 'labels',
            value: ''
        },
        {
            key: 'cfg',
            value: ''
        },
        {
            key: 'weights',
            value: ''
        }
    ],
    'gluoncv': [
        {
            key: 'train',
            value: ''
        },
        {
            key: 'val',
            value: ''
        },
        {
            key: 'test',
            value: ''
        }
    ],
    'cpt': [
        {
            key: 'dataset',
            value: ''
        }
    ],
    'gabsa': [
        {
            key: 'dataset',
            value: ''
        }
    ],
    'paddlenlp': [
        {
            key: 'dataset',
            value: ''
        }
    ],
    'paddleocr': [
        {
            key: 'dataset',
            value: ''
        },
        {
            key: 'pretrained_models',
            value: ''
        }
    ],
    'gluonts': [
        {
            key: 'dataset',
            value: ''
        }
    ]
}


export const SCENARIOS = [
    {label: 'ppe', value: 'ppe'}, 
    {label: 'track', value:'track'}, 
]

export const ENDPOINTOPTIONS : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.t2.medium', value: 'ml.t2.medium' }, 
            { label: 'ml.t2.large', value: 'ml.t2.large' }, 
            { label: 'ml.t2.xlarge', value: 'ml.t2.xlarge' }, 
            { label: 'ml.t2.2xlarge', value: 'ml.t2.2xlarge' }, 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m5d.large', value: 'ml.m5d.large' }, 
            { label: 'ml.m5d.xlarge', value: 'ml.m5d.xlarge' }, 
            { label: 'ml.m5d.2xlarge', value: 'ml.m5d.2xlarge' }, 
            { label: 'ml.m5d.4xlarge', value: 'ml.m5d.4xlarge' }, 
            { label: 'ml.m5d.12large', value: 'ml.m5d.12large' }, 
            { label: 'ml.m5d.24xlarge', value: 'ml.m5d.24xlarge' }, 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' },
            { label: 'ml.c4.large', value: 'ml.c4.large' },
            { label: 'ml.c4.xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' },
            { label: 'ml.c5d.large', value: 'ml.c5d.large' },
            { label: 'ml.c5d.xlarge', value: 'ml.c5d.xlarge' },
            { label: 'ml.c5d.2xlarge', value: 'ml.c5d.2xlarge' },
            { label: 'ml.c5d.4xlarge', value: 'ml.c5d.4xlarge' },
            { label: 'ml.c5d.9xlarge', value: 'ml.c5d.9xlarge' },
            { label: 'ml.c5d.18xlarge', value: 'ml.c5d.18xlarge' }
        ]
    },
    {
        label: 'Memory optimized', 
        options: [ 
            { label: 'ml.r5.large', value: 'ml.r5.large' },
            { label: 'ml.r5.xlarge', value: 'ml.r5.xlarge' },
            { label: 'ml.r5.2xlarge', value: 'ml.r5.2xlarge' },
            { label: 'ml.r5.4xlarge', value: 'ml.r5.4xlarge' },
            { label: 'ml.r5.12xlarge', value: 'ml.r5.12xlarge' },
            { label: 'ml.r5.24xlarge', value: 'ml.r5.24xlarge' },
            { label: 'ml.r5d.large', value: 'ml.r5d.large' },
            { label: 'ml.r5d.xlarge', value: 'ml.r5d.xlarge' },
            { label: 'ml.r5d.2xlarge', value: 'ml.r5d.2xlarge' },
            { label: 'ml.r5d.4xlarge', value: 'ml.r5d.4xlarge' },
            { label: 'ml.r5d.12xlarge', value: 'ml.r5d.12xlarge' },
            { label: 'ml.r5d.24xlarge', value: 'ml.r5d.24xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' },
            { label: 'ml.g4dn.xlarge', value: 'ml.g4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' },
            { label: 'ml.inf1.xlarge', value: 'ml.inf1.xlarge' },
            { label: 'ml.inf1.2xlarge', value: 'ml.inf1.2xlarge' },
            { label: 'ml.inf1.6xlarge', value: 'ml.inf1.6xlarge' },
            { label: 'ml.inf1.24xlarge', value: 'ml.inf1.24xlarge' },
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
        ]
    }
];

export const ACCELERALATOROPTIONS : SelectOption[] = [
    { label: 'none', value: 'none' },
    { label: 'ml.eia1.medium', value: 'ml.eia1.medium' },
    { label: 'ml.eia1.large', value: 'ml.eia1.large' },
    { label: 'ml.eia1.xlarge', value: 'ml.eia1.xlarge' },
    { label: 'ml.eia2.medium', value: 'ml.eia2.medium' },
    { label: 'ml.eia2.large', value: 'ml.eia2.large' },
    { label: 'ml.eia2.xlarge', value: 'ml.eia2.xlarge' },
]

export const TRAININGOPTIONS : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' } 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge'},
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge'},
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge'},
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge'},
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge'},
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge'},
            { label: 'ml.g4dn.xlarge', value: 'ml.g4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' }
        ]
    }
];