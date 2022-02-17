import React, { FunctionComponent } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button, Inline, Stack } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';

interface PathParams {
    name: string;
}

interface ModelFormProps {
    wizard?: boolean;
}

const ModelForm: FunctionComponent<ModelFormProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const onSubmit = () => {
        history.push('/case/' + name + '?tab=model')
    }
 
    const onCancel = () => {
        history.push('/case/' + name + '?tab=model')
    }

    const onRemove = () => {
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderModelSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Model settings">
                    <FormField label="Model name" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderModelTag = () => {
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

    const renderModelFormContent = () => {
        return (
            <FormSection header="Container definition">
                <FormField controlId='formFieldId1'>
                    <RadioGroup
                        items={[
                            <RadioButton value="single" description='Use this to host a single model in this container.'  checked={true}>Use a single model</RadioButton>, 
                            <RadioButton value="multiple" description='Use this to host multiple models in this container.' disabled={true}>Use multiple models</RadioButton>
                        ]}
                    />
                </FormField>          
                <FormField label="Location of inference code image" description='Type the registry path where the inference code image is stored in Amazon ECR.
    ' controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Location of model artifacts" description='Type the URL where model artifacts are stored in S3.' controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
        </FormSection>    
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create model"
                description="To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code."
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>            
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTag()}
            </Form>
        )
    }
}

export default ModelForm;