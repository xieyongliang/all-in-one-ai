import React, { FunctionComponent } from 'react';
import { Form, FormSection, FormField, Input, Button, Inline, Stack } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';

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

interface TrainingJobFormProps {
    wizard?: boolean;
}

const TrainingJobForm: FunctionComponent<TrainingJobFormProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [stateInstance, setStateInstance] = React.useState('');

    const onChange = (id: string, event: any) => {
        if(id === 'instance')
            setStateInstance(event);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '?tab=trainingjob')
    }

    const onCancel = () => {
        history.push('/case/' + name + '?tab=trainingjob')
    }

    const onRemove = () => {
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderTrainingJobSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Job settings">
                    <FormField label="job name" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderTrainingJobTag = () => {
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

    const renderTrainingJobContent = () => {
        return (
            <Stack>
                <FormSection header="Provide container ECR path">
                    <FormField label="Container" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                </FormSection>
                <FormSection header="Resource configuration">
                    <FormField label="Instance type" controlId="formFieldId1">
                    <Select
                            placeholder="Choose an option"
                            options={optionsInstance}
                            onChange={(event) => onChange('formFieldIdInstanceCount', event)}
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
            </Stack>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderTrainingJobSetting()}
                {renderTrainingJobContent()}
                {renderTrainingJobTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create training job"
                description="When you create a training job, Amazon SageMaker sets up the distributed compute cluster, performs the training, and deletes the cluster when training has completed. The resulting model artifacts are stored in the location you specified when you created the training job."
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>            
                {renderTrainingJobSetting()}
                {renderTrainingJobContent()}
                {renderTrainingJobTag()}
            </Form>
        )
    }
}

export default TrainingJobForm;