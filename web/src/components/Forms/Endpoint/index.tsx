import React, { FunctionComponent } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button, RadioGroup, RadioButton, Inline, Text, Stack } from 'aws-northstar';
import { useHistory } from 'react-router-dom'; 
import SimpleSelect from '../../Utils/SimpleSelect';
import {useParams} from "react-router-dom";

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

type OnChange = (name: string, value: string) => void

const optionsModel : SelectOption[] = [
    { label: 'model-1', value: 'model-1' }
]

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

const optionsElastic : SelectOption[] = [
    { label: 'none', value: 'none' },
    { label: 'ml.eia1.medium', value: 'ml.eia1.medium' },
    { label: 'ml.eia1.large', value: 'ml.eia1.large' },
    { label: 'ml.eia1.xlarge', value: 'ml.eia1.xlarge' },
    { label: 'ml.eia2.medium', value: 'ml.eia2.medium' },
    { label: 'ml.eia2.large', value: 'ml.eia2.large' },
    { label: 'ml.eia2.xlarge', value: 'ml.eia2.xlarge' },
]

interface PathParams {
    name: string;
}

interface EndpointFormProps {
    wizard?: boolean;
}

const EndpointForm: FunctionComponent<EndpointFormProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [stateModel, setStateModel] = React.useState('');

    const [stateInstance, setStateInstance] = React.useState('');

    const [stateElastic, setStateElastic] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'model')
            setStateModel(value);
        if(name === 'instance')
            setStateInstance(value);
        if(name === 'elastic')
            setStateElastic(value);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '/endpoint')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/endpoint')
    }

    const onRemove = () => {
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderEndpointSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Endpoint setting">
                    <FormField label="Endpooint name" description='Your application uses this name to access this endpoint.' controlId="formFieldId1" hintText='Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.'>
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                    <FormField label="Type of endpoint" controlId="formFieldId1">
                        <RadioGroup
                            items={[
                                <RadioButton value="provisioned" description='Use this to host a single model in this container.' >Provisioned</RadioButton>, 
                                <RadioButton value="serverless" description='Use this to host multiple models in this container.' >Serverless (In Preview)</RadioButton>
                            ]}
                        />                
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header="Endpoint setting">
                    <FormField label="Type of endpoint" controlId="formFieldId1">
                        <RadioGroup
                            items={[
                                <RadioButton value="provisioned" description='Use this to host a single model in this container.' >Provisioned</RadioButton>, 
                                <RadioButton value="serverless" description='Use this to host multiple models in this container.' >Serverless (In Preview)</RadioButton>
                            ]}
                        />                
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderEndpointTag = () => {
        if(!wizard) {
            return (
                <FormSection header="Tags - optional">
                    <Inline>
                        <FormField label="Key" controlId="formFieldId1">
                            <Input type="text" controlId="formFieldId1"/>
                        </FormField>
                        <FormField label="Value" controlId="formFieldId1">
                            <Inline>
                                <Input type="text" controlId="formFieldId1"/>
                            </Inline>
                        </FormField>
                        <FormField label="Operation" controlId="formFieldId1">
                            <Inline>
                                <Button onClick={onRemove}>Remove</Button>
                            </Inline>
                        </FormField>
                    </Inline>
                    <Button variant="link">Add tag</Button>
                </FormSection>
            )
        }
        else 
            return ''
    }

    const renderEndpointFormContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Model name" controlId="formFieldId1">
                    <SimpleSelect
                            placeholder="Choose an option"
                            name = 'model'
                            options={optionsModel}
                            onChange={onChange}
                        />
                </FormField>
                <FormField label="Instance type" controlId="formFieldId1">
                    <SimpleSelect
                            placeholder="Choose an option"
                            name = 'model'
                            options={optionsInstance}
                            onChange={onChange}
                        />
                </FormField>
                <FormField label="Elastic Inference" controlId="formFieldId1">
                    <SimpleSelect
                            placeholder="Choose an option"
                            name = 'elastic'
                            options={optionsElastic}
                            onChange={onChange}
                        />
                </FormField>
                <FormField label="Initial instance count" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='1'/>
                </FormField>
                <FormField label="Initial instance weight" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" value='1'/>
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create endpoint"
                description="To deploy models to Amazon SageMaker, first create an endpoint. Specify which models to deploy, and the relative traffic weighting and hardware requirements for each. "
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Form>
        )
    }
}

export default EndpointForm;