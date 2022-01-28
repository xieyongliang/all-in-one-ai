import React, { FunctionComponent, useState } from 'react';
import Stack from 'aws-northstar/layouts/Stack';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import SimpleSelect from '../SimpleSelect'
import Button from 'aws-northstar/components/Button';
import Inline from 'aws-northstar/layouts/Inline';
import Container from 'aws-northstar/layouts/Container';

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

const optionsData : SelectOption[]= [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' }
];

const optionsContent : SelectOption[]= [
    { label: 'image/png', value: 'image/png' },
    { label: 'image/jpg', value: 'image/jpg' },
    { label: 'image/jpeg', value: 'image/jpeg' }
];

const optionsModel : SelectOption[]= [
    { label: 'moodel-1', value: 'model-1' }
];

const optionsInstance : SelectOption[]= [
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

type OnChange = (name: string, value: string) => void

const TransformForm: FunctionComponent = () => {
    const [optiosnData, setOptionsData] = React.useState('');
    const [optioonsContent, setOptionsContent] = React.useState('');
    const [optioonsModel, setOptionsModel] = React.useState('');
    const [optioonsInstance, setOptionsInstance] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'data')
            setOptionsData(value);
        if(name === 'content')
            setOptionsContent(value);
        if(name === 'instance')
            setOptionsInstance(value);
    }
    
    return (
        <Stack spacing='s'>
            <FormSection header="Job configuration">
                <FormField label="Model" controlId="formFieldId1">
                    <SimpleSelect
                        placeholder="Choose an option"
                        name = 'model'
                        options={optionsModel}
                        onChange={onChange}
                    />
                </FormField>
                <FormField label="Instance Type" controlId="formFieldId3">
                    <SimpleSelect
                        placeholder="Choose an option"
                        name = 'content'
                        options={optionsInstance}
                        onChange={onChange}
                    />
                </FormField>
                <FormField label="Instance count" controlId="formFieldId3">
                    <Input value = '1'> </Input>
                </FormField>
                <FormField label="Max concurrent transforms" controlId="formFieldId3">
                    <Input value = '1'> </Input>
                </FormField>
            </FormSection>
            <FormSection header="Input configuration">
                <FormField label="Data type" controlId="formFieldId1">
                    <SimpleSelect
                        placeholder="Choose an option"
                        name = 'data'
                        options={optionsData}
                        onChange={onChange}
                    />
                </FormField>
                <FormField label="S3 input path" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId2" placeholder='S3Uri'/>
                </FormField>

                <FormField label="Content type" controlId="formFieldId3">
                    <SimpleSelect
                        placeholder="Choose an option"
                        name = 'content'
                        options={optionsContent}
                        onChange={onChange}
                    />
                </FormField>
            </FormSection>
            <FormSection header="Output configuration">
                <FormField label="S3 output path" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId2" placeholder='S3Uri'/>
                </FormField>
            </FormSection>
            <FormField controlId='button'>
                <Inline>
                    <Button>Cancel</Button>
                    <Button variant="primary">Start</Button>
                </Inline>
            </FormField>
        </Stack>
    );
}

export default TransformForm;