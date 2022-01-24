import React, { FunctionComponent, useState } from 'react';
import Stack from 'aws-northstar/layouts/Stack';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import Select from 'aws-northstar/components/Select';

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

const optionsS3Prefix : SelectOption[]= [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' }
];

const optionsContentType : SelectOption[]= [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' }
];

const TransformForm: FunctionComponent = () => {
    const [selectedOption, setSeletedOption] = React.useState<SelectOption>();

    const onChangeS3Prefix = (event: any) => {
        setSeletedOption(optionsS3Prefix.find(o => o.value === event.target.value));
    };

    const onChangeContentType = (event: any) => {
        setSeletedOption(optionsS3Prefix.find(o => o.value === event.target.value));
    };

    return (
        <Stack spacing='s'>
            <FormSection header="Input configuration">
                <FormField label="S3 data type" controlId="formFieldId1">
                    <Select
                        placeholder="Choose an option"
                        options={optionsS3Prefix}
                        selectedOption={selectedOption}
                        onChange={onChangeS3Prefix}
                    />
                </FormField>
                <FormField label="S3 data type" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" placeholder='S3Uri'/>
                </FormField>
                <FormField label="S3 data type" controlId="formFieldId1">
                    <Select
                        placeholder="Choose an option"
                        options={optionsContentType}
                        selectedOption={selectedOption}
                        onChange={onChangeS3Prefix}
                    />
                </FormField>
            </FormSection>
        </Stack>);
}

export default TransformForm;