import { FunctionComponent, useEffect, useState } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import Button from 'aws-northstar/components/Button';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form } from 'aws-northstar';
import axios from 'axios';
import Select, { SelectOption } from 'aws-northstar/components/Select';

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

interface PathParams {
    name: string;
}

const TransformJobForm: FunctionComponent = () => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [selectedDataType, setSelectedDataType] = useState<SelectOption>({ label: 'S3Prefix', value: 'S3Prefix' });
    const [selectedContentType, setSelectedContentType] = useState<SelectOption>({ label: 'image/png', value: 'image/png' });
    const [selectedInstanceType, setSelectedInstanceType] = useState<SelectOption>({});
    const [optionsModel, setOptionsModel] = useState([]);
    const [selectedModelName, setSelectedModelName] = useState<SelectOption>({});
    const [instanceCount, setInstanceCount] = useState(1);
    const [maxConcurrentTransforms, setMaxConcurrentTransforms] = useState(1);
    const [jobName, setJobName] = useState('');
    const [s3InputUri, setS3InputUri] = useState('');
    const [s3OutputUri, setS3OutputUri] = useState('');

    const onChange = ((id: string, event: any) => {
        if(id === 'formFieldIdJobName') {
            if(event !== jobName)
                setJobName(event);
        }
        if(id === 'formFieldIdModelName') {
            if(event.target.value !== selectedModelName.value)
                setSelectedModelName({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdDataType') {
            if(event.target.value !== selectedDataType.value)
                setSelectedDataType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdContentType') {
            if(selectedContentType == undefined || event.target.value !== selectedContentType.value)
                setSelectedContentType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceType') {
            if(event.target.value !== selectedInstanceType.value)
                setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceCount') {
            if(event != instanceCount)
            setInstanceCount(event);
        }
        if(id === 'formFieldIdMaxConcurrentTransform') {
            if(event != maxConcurrentTransforms)
            setMaxConcurrentTransforms(event);
        }        
        if(id === 'formFieldIdS3InputUri') {
            if(event != s3InputUri)
            setS3InputUri(event);
        }        
        if(id === 'formFieldIdS3Output') {
            if(event != s3OutputUri)
            setS3OutputUri(event);
        }        
    })

    const onSubmit = () => {
        history.push('/case/' + name + '/demo?tab=transform')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/demo?tab=transform')
    }

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
                    <Input value = {instanceCount} onChange={(event) => onChange('formFieldIdJobName', event)}> </Input>
                </FormField>
                <FormField label="Model name" controlId="formFieldIdModelName">
                    <Select
                        placeholder="Choose an option"
                        options={optionsModel}
                        selectedOption={selectedModelName}
                        onChange={(event) => onChange('formFieldIdModel', event)}
                    />
                </FormField>
                <FormField label="Instance Type" controlId="formFieldIdInstanceType">
                    <Select
                        placeholder="Choose an option"
                        options={optionsInstanceType}
                        selectedOption={selectedInstanceType}
                        onChange={(event) => onChange('formFieldIdInstanceType', event)}
                    />
                </FormField>
                <FormField label="Instance count" controlId="formFieldIdInstanceCount">
                    <Input value = {instanceCount} onChange={(event) => onChange('formFieldIdInstanceCount', event)}> </Input>
                </FormField>
                <FormField label="Max concurrent transforms" controlId="formFieldId3">
                    <Input value = {maxConcurrentTransforms} onChange={(event) => onChange('formFieldIdS3Input', event)}/>
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
                    <Input type="text" placeholder='S3Uri' onChange={(event) => onChange('formFieldIdS3InputUri', event)}/>
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
                    <Input type="text" controlId="formFieldId2" placeholder='S3Uri' onChange={(event) => onChange('formFieldIdS3OutputUri', event)}/>
                </FormField>
            </FormSection>
        </Form>
    );
}

export default TransformJobForm;