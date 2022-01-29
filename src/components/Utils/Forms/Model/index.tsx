import React, { FunctionComponent } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button, Inline } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';

interface PathParams {
    name: string;
}

const ModelForm: FunctionComponent = () => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const onSubmit = () => {
        history.push('/case/' + name + '/model')
    }
 
    const onCancel = () => {
        history.push('/case/' + name + '/model')
    }

    const onRemove = () => {
    }

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
            <FormSection header="Model settings">
                <FormField label="Model name" controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
            </FormSection>
            <FormSection header="Container definition">
                <RadioGroup
                    items={[
                        <RadioButton value="single" description='Use this to host a single model in this container.' >Use a single model</RadioButton>, 
                        <RadioButton value="multiple" description='Use this to host multiple models in this container.' >Use multiple models</RadioButton>
                    ]}
                />                
                <FormField label="Location of inference code image" description='Type the registry path where the inference code image is stored in Amazon ECR.
' controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                <FormField label="Location of model artifacts" description='Type the URL where model artifacts are stored in S3.' controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
            </FormSection>
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
        </Form>
    )
}

export default ModelForm;