import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Input, Button, Stack, Select } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { SelectOption } from 'aws-northstar/components/Select';

const optionsDataType : SelectOption[]= [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' }
];

const optionsContentType : SelectOption[]= [
    { label: 'image/png', value: 'image/png' },
    { label: 'image/jpg', value: 'image/jpg' },
    { label: 'image/jpeg', value: 'image/jpeg' }
];

const optionsInstanceType : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.2large', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2large', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4large', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12large', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24large', value: 'ml.m5.24xlarge' }
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
    }
];

const TransformJobForm: FunctionComponent = () => {
    const [selectedDataType, setSelectedDataType] = useState<SelectOption>({ label: 'S3Prefix', value: 'S3Prefix' });
    const [selectedContentType, setSelectedContentType] = useState<SelectOption>({ label: 'image/png', value: 'image/png' });
    const [selectedInstanceType, setSelectedInstanceType] = useState<SelectOption>({});
    const [optionsModel, setOptionsModel] = useState([]);
    const [selectedModelName, setSelectedModelName] = useState<SelectOption>({});
    const [instanceCount, setInstanceCount] = useState(1);
    const [maxConcurrentTransforms, setMaxConcurrentTransforms] = useState(1);
    const [transformJobName, setTransformJobName] = useState('');
    const [s3InputUri, setS3InputUri] = useState('');
    const [s3OutputUri, setS3OutputUri] = useState('');
    const [invalidTransformJobName, setInvalidTransformJobName] = useState(false);
    const [invalidInstanceType, setInvalidInstanceType] = useState(false);
    const [invalidModelName, setInvalidInvalidModelName] = useState(false);
    const [invalidS3InputUri, setInvalidS3InputUri] = useState(false);
    const [invalidS3OutputUri, setInvalidS3OutputUri] = useState(false);

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/model')
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.model_name, value: item.model_name})
            }
            setOptionsModel(items);
            console.log(items);
        }, (error) => {
            console.log(error);
        });
    }, [])

    const onChange = ((id: string, event: any) => {
        if(id === 'formFieldIdJobName') {
            setTransformJobName(event);
            setInvalidTransformJobName(event === '')
        }
        if(id === 'formFieldIdModelName') {
            setSelectedModelName({ label: event.target.value, value: event.target.value });
            setInvalidInvalidModelName(false);
        }
        if(id === 'formFieldIdDataType') {
            setSelectedDataType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdContentType') {
            setSelectedContentType({ label: event.target.value, value: event.target.value });
            setInvalidInstanceType(true);
        }
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(event);
        }
        if(id === 'formFieldIdMaxConcurrentTransform') {
            setMaxConcurrentTransforms(event);
        }        
        if(id === 'formFieldIdS3InputUri') {
            setS3InputUri(event);
            setInvalidS3InputUri(!event.startsWith('s3://'))
        }        
        if(id === 'formFieldIdS3OutputUri') {
            setS3OutputUri(event);
            setInvalidS3OutputUri(!event.startsWith('s3://'))
        }        
    })

    const onSubmit = () => {
        if(transformJobName === '' || invalidTransformJobName)
            setInvalidTransformJobName(true)
        else if(s3InputUri === '' || invalidS3InputUri)
            setInvalidS3InputUri(true)
        else if(s3OutputUri === '' || invalidS3OutputUri)
            setInvalidS3OutputUri(true)
        else if(selectedModelName.value === undefined)
            setInvalidInvalidModelName(true)
        else if(selectedInstanceType.value === undefined)
            setInvalidInstanceType(true)
        else {
            var body = {
                'transformjob_name' : transformJobName,
                'model_name': selectedModelName.value,
                'data__type': selectedDataType.value,
                'content_type': selectedContentType.value,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'max_concurrent_transforms': maxConcurrentTransforms,
                's3_input_uri': s3InputUri,
                's3_output_uri': s3OutputUri
            }
            axios.post('/transformjob', body) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=demo#transform`)
            }, (error) => {
                console.log(error);
            });    
        }
    }

    const onCancel = () => {
        history.push(`/case/${params.name}?tab=demo#transform`)
    }
    
    return (
        <Form
            header="Create batch transform job"
            description="A transform job uses a model to transform data and stores the results at a specified location."
            actions={
                <div>
                    <Button variant="link" onClick={onCancel}>Cancel</Button>
                    <Button variant="primary" onClick={onSubmit}>Submit</Button>
                </div>
            }>            
            <FormSection header="Job configuration">
                <FormField label="Job name" controlId="formFieldIdJobName">
                    <Input value = {transformJobName} invalid={invalidTransformJobName} onChange={(event) => onChange('formFieldIdJobName', event)}> </Input>
                </FormField>
                <FormField label="Model name" controlId="formFieldIdModelName">
                    <Select
                        placeholder="Choose an option"
                        options={optionsModel}
                        selectedOption={selectedModelName}
                        invalid={invalidModelName}
                        onChange={(event) => onChange('formFieldIdModelName', event)}
                    />
                </FormField>
                <FormField label="Instance Type" controlId="formFieldIdInstanceType">
                    <Select
                        placeholder="Choose an option"
                        options={optionsInstanceType}
                        selectedOption={selectedInstanceType}
                        invalid={invalidInstanceType}
                        onChange={(event) => onChange('formFieldIdInstanceType', event)}
                    />
                </FormField>
                <FormField label="Instance count" controlId="formFieldIdInstanceCount">
                    <Input value = {instanceCount} type={'number'} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)}> </Input>
                </FormField>
                <FormField label="Max concurrent transforms" controlId="formFieldId3">
                    <Input value = {maxConcurrentTransforms} type={'number'} required={true} onChange={(event) => onChange('formFieldIdS3Input', event)}/>
                </FormField>
            </FormSection>
            <FormSection header="Input configuration">
                <FormField label="Data type" controlId="formFieldIdDataType">
                    <Select
                        placeholder="Choose an option"
                        options={optionsDataType}
                        selectedOption={selectedDataType}
                        onChange={(event) => onChange('formFieldIdDataType', event)}
                    />
                </FormField>
                <FormField label="S3 input path" controlId="formFieldIdS3InputUri">
                    <Input type="text" placeholder='S3Uri' required={true} invalid={invalidS3InputUri} onChange={(event) => onChange('formFieldIdS3InputUri', event)}/>
                </FormField>

                <FormField label="Content type" controlId="formFieldIdContentType">
                    <Select
                        placeholder="Choose an option"
                        options={optionsContentType}
                        selectedOption={selectedContentType}
                        onChange={(event) => onChange('formFieldIdContentType', event)}
                    />
                </FormField>
            </FormSection>
            <FormSection header="Output configuration">
                <FormField label="S3 output path" controlId="formFieldIdS3OutputUri">
                    <Input type="text" placeholder='S3Uri' required={true} invalid={invalidS3OutputUri} onChange={(event) => onChange('formFieldIdS3OutputUri', event)}/>
                </FormField>
            </FormSection>
        </Form>
    );
}

export default TransformJobForm;