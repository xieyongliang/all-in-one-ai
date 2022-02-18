import React, { FunctionComponent } from 'react';
import { Form, FormSection, FormField, Button, Input, Inline, Text, Stack, Select } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

const optionsModel : SelectOption[] = [
    { label: 'model-1', value: 'model-1' }
]

interface PathParams {
    name: string;
}

interface GreengrassComponentFormProps {
    wizard?: boolean;
}

const GreengrassComponentForm: FunctionComponent<GreengrassComponentFormProps> = (props) => {
    const [selectedModelName, setSelectedModelName] = React.useState({});

    const history = useHistory();
    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdModelName')
            setSelectedModelName({ label: event.target.value, value: event.target.value });
    }

    const onSubmit = () => {
        history.push('/case/' + params.name + '?tab=component')
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=component')
    }

    const onRemove = () => {
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderGreengrassComponentSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Greengrass component setting">
                    <FormField label="Component name" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderGreengrassTag = () => {
        if(!wizard) {
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
        }
    }

    const renderGreengrassContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Model name" controlId="formFieldIdModelName">
                    <Select
                            placeholder="Choose an option"
                            options={optionsModel}
                            onChange={(event) => onChange('formFieldIdDataType', event)}
                        />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderGreengrassComponentSetting()}
                {renderGreengrassContent()}
                {renderGreengrassTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create Greengrass component"
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>
                {renderGreengrassComponentSetting()}
                {renderGreengrassContent()}
                {renderGreengrassTag()}
            </Form>
        )
    }
}

export default GreengrassComponentForm;