import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import FormSection from 'aws-northstar/components/FormSection';
import FormField from 'aws-northstar/components/FormField';
import Input from 'aws-northstar/components/Input';
import { Form, Button, RadioGroup, RadioButton, Inline, Text, Stack, Select } from 'aws-northstar';
import { useHistory } from 'react-router-dom'; 
import {useParams} from "react-router-dom";

interface SelectOption {
    label?: string;
    value?: string;
    options?: SelectOption[];
}

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
    const [stateType, setStateType] = React.useState('1');
    const [selectedTargetName, setSelectedTargetName] = React.useState({});
    const [selectedComponentName, setSelectedComponentName] = React.useState({});
    const [selectedComponentVersion, setSelectedComponentVersion] = React.useState({});

    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name

    const onChange = (id: string, event: any) => {
        if(id === 'target')
            setStateType(event);
    }

    const onSubmit = () => {
        history.push('/case/' + name + '?tab=deployment')
    }

    const onCancel = () => {
        history.push('/case/' + name + '?tab=deployment')
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
                    <FormField label="Target name" controlId="formFieldIdTargetName">
                        <Select
                                placeholder="Choose an option"
                                options={optionsTarget}
                                onChange={(event) => onChange('formFieldIdTargetName', event)}
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
                <FormField label="Component name" controlId="formFieldIdComponentName">
                        <Select
                                placeholder="Choose an option"
                                options={optionsComponent}
                                onChange={(event) => onChange('formFieldIdComponentName', event)}
                            />
                </FormField>
                <FormField label="Component version" controlId="formFieldIdComponentVersion">
                        <Select
                                placeholder="Choose an option"
                                options={optionsVersion}
                                onChange={(event) => onChange('formFieldIdComponentVersion', event)}
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