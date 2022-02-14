import React, { ChangeEvent, FunctionComponent, useState } from 'react';
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

const optionsTarget : SelectOption[] = [
    { label: 'GreengrassQuickStartGroup', value: 'GreengrassQuickStartGroup' }
]

const optionsComponent : SelectOption[] = [
    { label: 'com.example.yolov5', value: 'com.example.yolov5' }
]

const optionsVersion : SelectOption[] = [
    { label: '1.0.0', value: '1.0.0' }
]

interface PathParams {
    name: string;
}

interface GreengrassDeploymentFormProps {
    wizard?: boolean;
}

const GreengrassDeploymentForm: FunctionComponent<GreengrassDeploymentFormProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const [stateType, setStateType] = React.useState('1');

    const [stateTarget, setStateTarget] = React.useState('');

    const onChange : OnChange = (name: string, value: string) => {
        if(name === 'target')
            setStateTarget(value);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '/deployment')
    }

    const onCancel = () => {
        history.push('/case/' + name + '/deployment')
    }

    const onRemove = () => {
    }

    const onChangeOption = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var target : string = value || ''
        setStateType(target)
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard
    
    const renderGreengrassDeploymentSetting = () => {
        if(!wizard) {
            return (
                <FormSection header="Greengrass deployment setting">
                <FormField label="Deployment name" description='A friendly name lets you identify this deployment. If you leave it blank, the deployment displays its ID instead of a name.' controlId="formFieldId1">
                    <Input type="text" controlId="formFieldId1" />
                </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderGreengrassDeploymentTarget = () => {
        if(stateType === '1') {
            return (
                <FormSection header="Deployment target" description='You can deploy to a single Greengrass core device or a group of core devices.'>
                    <FormField label="Target type" controlId="formFieldId1">
                        <RadioGroup onChange={onChangeOption}
                                items={[
                                    <RadioButton value='0' checked={false}>Core device</RadioButton>, 
                                    <RadioButton value='1' checked={true}>Thing group</RadioButton>                
                                ]}
                            />
                    </FormField>
                    <FormField label="Target name" controlId="formFieldId1">
                        <SimpleSelect
                                placeholder="Choose an option"
                                name = 'target'
                                options={optionsTarget}
                                onChange={onChange}
                            />
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header="Deployment target" description='You can deploy to a single Greengrass core device or a group of core devices.'>
                    <FormField label="Target type" controlId="formFieldId1">
                        <RadioGroup onChange={onChangeOption}
                                items={[
                                    <RadioButton value='0' checked={true}>Core device</RadioButton>, 
                                    <RadioButton value='1' checked={false}>Thing group</RadioButton>                
                                ]}
                            />
                    </FormField>
                    <FormField label="Target name" controlId="formFieldId1">
                        <Input type="text" controlId="formFieldId1" />
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderGreengrassDeploymentTag = () => {
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

    const renderGreengrassDeploymentContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Component name" controlId="formFieldId1">
                        <SimpleSelect
                                placeholder="Choose an option"
                                name = 'component'
                                options={optionsComponent}
                                onChange={onChange}
                            />
                </FormField>
                <FormField label="Component version" controlId="formFieldId1">
                        <SimpleSelect
                                placeholder="Choose an option"
                                name = 'version'
                                options={optionsVersion}
                                onChange={onChange}
                            />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderGreengrassDeploymentSetting()}
                {renderGreengrassDeploymentTarget()}
                {renderGreengrassDeploymentContent()}
                {renderGreengrassDeploymentTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create Greengrass deployment"
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>        
                {renderGreengrassDeploymentSetting()}
                {renderGreengrassDeploymentTarget()}
                {renderGreengrassDeploymentContent()}
                {renderGreengrassDeploymentTag()}
            </Form>
        )
    }
}

export default GreengrassDeploymentForm;