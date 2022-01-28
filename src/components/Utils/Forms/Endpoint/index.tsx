import React, { FunctionComponent } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button } from 'aws-northstar';
import { useHistory } from 'react-router-dom'; 
import SimpleSelect from '../SimpleSelect';
import {useParams} from "react-router-dom";

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

type OnChange = (name: string, value: string) => void

const optionsInstance : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m4.xlarge', value: 'ml.m4.xlarge' }, 
            { label: 'ml.m4.2xlarge', value: 'ml.m4.2xlarge' }, 
            { label: 'ml.m4.4xlarge', value: 'ml.m4.4xlarge' }, 
            { label: 'ml.m4.10large', value: 'ml.m4.10large' }, 
            { label: 'ml.m4.16xlarge', value: 'ml.m4.16xlarge' }, 
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
            { label: 'ml.c4.1xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' },
            { label: 'ml.c5n.xlarge', value: 'ml.c5n.xlarge' },
            { label: 'ml.c5n.2xlarge', value: 'ml.c5n.2xlarge' },
            { label: 'ml.c5n.4xlarge', value: 'ml.c5n.4xlarge' },
            { label: 'ml.c5n.9xlarge', value: 'ml.c5n.9xlarge' },
            { label: 'ml.c5n.18xlarge', value: 'ml.c5n.18xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' },
            { label: 'ml.p3dn.24xlarge', value: 'ml.p3dn.24xlarge' },
            { label: 'ml.p4dn.xlarge', value: 'ml.p4dn.xlarge' },
            { label: 'ml.p4dn.2xlarge', value: 'ml.p4dn.2xlarge' },
            { label: 'ml.p4dn.4xlarge', value: 'ml.p4dn.4xlarge' },
            { label: 'ml.p4dn.8xlarge', value: 'ml.p4dn.8xlarge' },
            { label: 'ml.p4dn.12xlarge', value: 'ml.p4dn.12xlarge' },
            { label: 'ml.p4dn.16xlarge', value: 'ml.p4dn.16xlarge' },
            { label: 'ml.p4d.24xlarge', value: 'ml.p4d.24xlarge' },
            { label: 'ml.g5.xlarge', value: 'ml.g5.xlarge' },
            { label: 'ml.g5.2xlarge', value: 'ml.g5.2xlarge' },
            { label: 'ml.g5.4xlarge', value: 'ml.g5.4xlarge' },
            { label: 'ml.g5.8xlarge', value: 'ml.g5.8xlarge' },
            { label: 'ml.g5.12xlarge', value: 'ml.g5.12xlarge' },
            { label: 'ml.g5.16xlarge', value: 'ml.g5.16xlarge' },
            { label: 'ml.g5.24xlarge', value: 'ml.g5.24xlarge' },
            { label: 'ml.g5.48xlarge', value: 'ml.g5.48xlarge' }
        ]
    }

];

interface PathParams {
    name: string;
}

const EndpointForm: FunctionComponent = () => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [optioonsInstance, setOptionsInstance] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'instance')
            setOptionsInstance(value);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '/trainingjob')
    }

    return (
        <Form
            header="Create endpoint"
            description="You can view source to see how components are put together"
            actions={
                <div>
                    <Button variant="link">Cancel</Button>
                    <Button variant="primary" onClick={onSubmit}>Submit</Button>
                </div>
            }>            
            <FormSection header="Job settings">
                <FormField label="job name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
            </FormSection>
            <FormSection header="Provide container ECR path">
                <FormField label="Container" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
            </FormSection>
            <FormSection header="Resource configuration">
                <FormField label="Instance type" controlId="formFieldId1">
                <SimpleSelect
                        placeholder="Choose an option"
                        name = 'instance'
                        options={optionsInstance}
                        onChange={onChange}
                    />
                </FormField>
                <FormField label="Instance count" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='1'/>
                </FormField>
                <FormField label="Additional storage volume per instance (GB)" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='30'/>
                </FormField>
            </FormSection>
            <FormSection header="Input data configuration">
                <FormField label="Input data s3uri" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Images prefix" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='images'/>
                </FormField>
                <FormField label="Lables prefix" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='labels'/>
                </FormField>
                <FormField label="Weights prefix" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='weights' />
                </FormField>
                <FormField label="Cfg prefix" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='cfg'/>
                </FormField>
            </FormSection>
            <FormSection header="Output data configuration">
                <FormField label="Output data s3uri" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
            </FormSection>
        </Form>
    )
}

export default EndpointForm;