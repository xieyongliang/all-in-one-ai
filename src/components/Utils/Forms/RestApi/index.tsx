import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button, RadioGroup, RadioButton, Inline, Stack } from 'aws-northstar';
import { useHistory } from 'react-router-dom'; 
import SimpleSelect from '../SimpleSelect';
import {useParams} from "react-router-dom";

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

type OnChange = (name: string, value: string) => void

const optionsEndpoint : SelectOption[] = [
    { label: 'endpoint-1', value: 'endpoint-1' }
]

const optionsApi : SelectOption[] = [
    { label: 'api-1', value: 'api-1' }
]

interface PathParams {
    name: string;
}

interface RestApiFormProps {
    wizard?: boolean;
}

const RestApiForm: FunctionComponent<RestApiFormProps> = (props) => {
    const [optioonsEndpoint, setOptionsEndpoint] = React.useState('');

    const [optioonsApi, setOptionsApi] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'endpoint')
            setOptionsEndpoint(value);
        if(name === 'api')
            setOptionsApi(value);
    }

    const [stateType, setStateType] = useState('1')

    const onChangeOption = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var option : string = value || ''
        setStateType(option)
    }

    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const onSubmit = () => {
        history.push('/case/' + name + '/restapi')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/restapi')
    }

    const onRemove = () => {
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderRestApiSetting = () => {
        if(stateType === '1') {
            return (
                <FormSection header="Rest API setting">
                    <FormField label="API Gateway" controlId="formFieldId1">
                        <RadioGroup onChange={onChangeOption}
                            items={[
                                <RadioButton value='0' checked={false}>Create new Rest API</RadioButton>, 
                                <RadioButton value='1' checked={true}>Select existing Rest API</RadioButton>                
                            ]}
                        />
                    </FormField>
                    <FormField controlId='formField1'>
                        <SimpleSelect
                            placeholder="Choose an option"
                            name = 'api'
                            options={optionsApi}
                            onChange={onChange}
                        />
                    </FormField>
                    <FormField label="API path" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" value='/yolov5'/>
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header="Rest API setting">
                    <FormField label="API Gateway" controlId="formFieldId1">
                        <RadioGroup onChange={onChangeOption}
                            items={[
                                <RadioButton value='0' checked={true}>Create new Rest API</RadioButton>, 
                                <RadioButton value='1' checked={false}>Select existing Rest API</RadioButton>                
                            ]}
                        />
                    </FormField>
                    <FormField controlId='formField1'>
                        <Input type="text" controlId="formFieldId1"/>
                    </FormField>
                    <FormField label="API path" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" value='/yolov5'/>
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderRestApiTag = () => {
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
    }

    const renderRestApiFormContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Endpoint name" controlId="formFieldId1">
                    <SimpleSelect
                        placeholder="Choose an option"
                        name = 'endpoint'
                        options={optionsEndpoint}
                        onChange={onChange}
                    />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderRestApiSetting()}
                {renderRestApiFormContent()}
                {renderRestApiTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create restapi"
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }> 
                {renderRestApiSetting()}
                {renderRestApiFormContent()}
                {renderRestApiTag()}
            </Form>
        )
    }
}

export default RestApiForm;