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

interface PathParams {
    name: string;
}

interface GreengrassComponentFormProps {
    wizard?: boolean;
}

const GreengrassComponentForm: FunctionComponent<GreengrassComponentFormProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [stateModel, setStateModel] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'model')
            setStateModel(value);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '/component')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/component')
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
                <FormField label="Model name" controlId="formFieldId1">
                    <SimpleSelect
                            placeholder="Choose an option"
                            name = 'model'
                            options={optionsModel}
                            onChange={onChange}
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