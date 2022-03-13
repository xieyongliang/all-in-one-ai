import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Stack, Select, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { UpdateGreenGrassComponentVersion } from '../../../store/pipelines/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';

interface IProps {
    updateGreenGrassComponentVersionAction: (greengrassComponentVersion: string) => any;
    greengrassComponentVersion: string;
    wizard?: boolean;
}

const GreengrassComponentForm: FunctionComponent<IProps> = (props) => {
    const [ optionsModels, setOptionsModels ] = useState([]);
    const [ selectedModel, setSelectedModel ] = useState<SelectOption>({});
    const optionsComponents = [{label: 'com.example.yolov5', value: 'com.example.yolov5'}];
    const [ selectedComponent, setSelectedComponent ] = useState<SelectOption>({})
    const [ componentVersion, setComponentVersion ] = useState(props.wizard ? props.greengrassComponentVersion : '')
    const [ invalidModel, setInvalidModel ] = useState(false)
    const [ invalidComponent, setInvalidComponent ] = useState(false)
    const [ invalidComponentVersion, setInvalidComponentVersion ] = useState(false)
    const [ modelDict ] = useState({})

    const history = useHistory();
    
    var params : PathParams = useParams();

    useEffect(() => {
        axios.get(`/model?case=${params.name}`)
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.model_name, value: item.model_name})
                modelDict[item.model_name] = item.model_data_url
            }
            setOptionsModels(items);
        }, (error) => {
            console.log(error);
        });
    }, [params.name, modelDict])

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdModels')
            setSelectedModel({ label: event.target.value, value: event.target.value });
        if(id === 'formFieldIdComponents')
            setSelectedComponent({ label: event.target.value, value: event.target.value });
        if(id === 'formFieldIdMComponentVersion') {
            setComponentVersion(event);
            props.updateGreenGrassComponentVersionAction(event);
        }
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
                'component_version': componentVersion,
                'case_name': params.name,
                'model_data_url': modelDict[selectedModel.value]
            }
            axios.post(`/greengrass/component/${selectedComponent.value}`, body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.goBack()
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });

        }
    }

    const onCancel = () => {
        history.goBack()
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderGreengrassComponentSetting = () => {
        if(!wizard) {
            return (
                <FormSection header='Greengrass component setting'>
                    <FormField label='Component name' controlId='formFieldIdComponents'>
                        <Select
                                placeholder='Choose an option'
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
        if(!wizard)
            return (
                <FormSection header='Production variants'>
                    <FormField label='Model name' controlId='formFieldIdModels'>
                        <Select
                                placeholder='Choose an option'
                                options={optionsModels}
                                selectedOption={selectedModel}
                                invalid={invalidModel}
                                onChange={(event) => onChange('formFieldIdModels', event)}
                            />
                    </FormField>
                    <FormField label='Component version' controlId='formFieldIdMComponentVersion'>
                        <Input value={componentVersion} invalid={invalidComponentVersion} onChange={(event) => onChange('formFieldIdMComponentVersion', event)} />
                    </FormField>
                </FormSection>
            )
        else
            return (
                <FormSection header='Production variants'>
                    <FormField label='Component version' controlId='formFieldIdMComponentVersion'>
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
                header='Create Greengrass component'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit}>Submit</Button>
                    </div>
                }>
                {renderGreengrassComponentSetting()}
                {renderGreengrassContent()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateGreenGrassComponentVersionAction: UpdateGreenGrassComponentVersion
};

const mapStateToProps = (state: AppState) => ({
    greengrassComponentVersion : state.pipeline.greengrassComponentVersion
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GreengrassComponentForm);