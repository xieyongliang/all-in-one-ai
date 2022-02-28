import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Stack, Select, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

interface GreengrassComponentFormProps {
    wizard?: boolean;
}

const GreengrassComponentForm: FunctionComponent<GreengrassComponentFormProps> = (props) => {
    const [ optionsModels, setOptionsModels ] = useState([]);
    const [ selectedModel, setSelectedModel ] = useState<SelectOption>({});
    const optionsComponents = [];
    optionsComponents.push({label: 'yolov5', value: 'com.example.yolov5'})
    const [ selectedComponent, setSelectedComponent ] = useState<SelectOption>({})
    const [ componentVersion, setComponentVersion ] = useState('')
    const [ invalidModel, setInvalidModel ] = useState(false)
    const [ invalidComponent, setInvalidComponent ] = useState(false)
    const [ invalidComponentVersion, setInvalidComponentVersion ] = useState(false)

    const history = useHistory();
    
    var params : PathParams = useParams();

    useEffect(() => {
        axios.get(`/model?case=${params.name}`)
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.model_name, value: item.model_data_url})
            }
            setOptionsModels(items);
            console.log(items);
        }, (error) => {
            console.log(error);
        });
    }, [params.name])

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdModels')
            setSelectedModel({ label: event.target.key, value: event.target.value });
        if(id === 'formFieldIdComponents')
            setSelectedComponent({ label: event.target.key, value: event.target.value });
        if(id === 'formFieldIdMComponentVersion')
            setComponentVersion(event)
    }

    const onSubmit = () => {
        if(selectedComponent.value === undefined)
            setInvalidComponent(true)
        else if(selectedModel.value === undefined)
            setInvalidModel(true)
        else if(componentVersion === '')
            setInvalidComponentVersion(true)
        else {
            var body = {
                'component_name' : selectedComponent.value,
                'component_version': componentVersion,
                'case_name': params.name,
                'model_data_url': selectedModel.value
            }
            axios.post('/greengrass/component', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=component`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });

        }
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=component')
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
                    <FormField label="Component name" controlId="formFieldIdComponents">
                        <Select
                                placeholder="Choose an option"
                                options={optionsComponents}
                                selectedOption={selectedComponent}
                                invalid={invalidComponent}
                                onChange={(event) => onChange('formFieldIdComponents', event)}
                            />
                        </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderGreengrassContent = () => {
        return (
            <FormSection header="Production variants">
                <FormField label="Model name" controlId="formFieldIdModels">
                    <Select
                            placeholder="Choose an option"
                            options={optionsModels}
                            selectedOption={selectedModel}
                            invalid={invalidModel}
                            onChange={(event) => onChange('formFieldIdModels', event)}
                        />
                </FormField>
                <FormField label="Component version" controlId="formFieldIdMComponentVersion">
                    <Input value={componentVersion} invalid={invalidComponentVersion} onChange={(event) => onChange('formFieldIdMComponentVersion', event)} />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderGreengrassComponentSetting()}
                {renderGreengrassContent()}
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
            </Form>
        )
    }
}

export default GreengrassComponentForm;