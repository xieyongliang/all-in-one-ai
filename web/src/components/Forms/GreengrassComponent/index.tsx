import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Stack, Select, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { UpdateGreengrassComponentName, UpdateGreengrassComponentVersion } from '../../../store/pipelines/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';

interface IProps {
    updateGreengrassComponentNameAction: (greengrassComponentName: string) => any;
    updateGreengrassComponentVersionAction: (greengrassComponentVersion: string) => any;
    greengrassComponentName: string;
    greengrassComponentVersion: string;
    wizard?: boolean;
}

const getModel = async (modelName) => {
    var response = await axios.get(`/model`, {params : { industrial_model: modelName}})

    return response.data
}

const getModelPackage = async (modelPackageName) => {
    var response = await axios.get(`/modelpackage`, {params: {model_package_arn: modelPackageName}})

    return response.data
}

const GreengrassComponentForm: FunctionComponent<IProps> = (props) => {
    const [ optionsModels, setOptionsModels ] = useState([]);
    const [ selectedModel, setSelectedModel ] = useState<SelectOption>({});
    const optionsComponents = [{label: 'com.example.yolov5', value: 'com.example.yolov5'}];
    const [ selectedComponent, setSelectedComponent ] = useState<SelectOption>(props.wizard ? {label: props.greengrassComponentName, value: props.greengrassComponentName}: {})
    const [ componentVersion, setComponentVersion ] = useState(props.wizard ? props.greengrassComponentVersion : '')
    const [ invalidModel, setInvalidModel ] = useState(false)
    const [ invalidComponent, setInvalidComponent ] = useState(false)
    const [ invalidComponentVersion, setInvalidComponentVersion ] = useState(false)
    const [ itemsModel ] = useState({})
    const [ processing, setProcessing ] = useState(false)

    const history = useHistory();
    
    var params : PathParams = useParams();

    useEffect(() => {
       getModel(params.id).then((data) => {
            var items = []
            for(let item of data) {
                if(item['Containers'] !== undefined) {
                    var modelPackageName = item['Containers'][0]['ModelPackageName']
                    getModelPackage(modelPackageName).then((data) => {
                        var modelDataUrl = data['InferenceSpecification']['Containers'][0]['ModelDataUrl']
                        itemsModel[item['ModelName']] = modelDataUrl
                    })
                }
                else {
                    var modelDataUrl = item['PrimaryContainer']['ModelDataUrl']
                    itemsModel[item['ModelName']] = modelDataUrl
                }
                items.push({label: item.ModelName, value: item.ModelName})
            }
            setOptionsModels(items);
        }, (error) => {
            console.log(error);
        });
    }, [params.id, itemsModel])

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdModels')
            setSelectedModel({ label: event.target.value, value: event.target.value });
        if(id === 'formFieldIdComponents') {
            setSelectedComponent({ label: event.target.value, value: event.target.value });
            if(wizard) {
                props.updateGreengrassComponentNameAction(event.target.value)
            }
        }
        if(id === 'formFieldIdMComponentVersion') {
            setComponentVersion(event);
            if(wizard) {
                props.updateGreengrassComponentVersionAction(event);
            }
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
                'industrial_model': params.id,
                'model_data_url': itemsModel[selectedModel.value]
            }
            setProcessing(true)
            axios.post(`/greengrass/component/${selectedComponent.value}`, body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.goBack()
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessing(false);
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
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                    </div>
                }>
                {renderGreengrassComponentSetting()}
                {renderGreengrassContent()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateGreengrassComponentNameAction : UpdateGreengrassComponentName,
    updateGreengrassComponentVersionAction: UpdateGreengrassComponentVersion
};

const mapStateToProps = (state: AppState) => ({
    greengrassComponentName: state.pipeline.greengrassComponentName,
    greengrassComponentVersion : state.pipeline.greengrassComponentVersion
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GreengrassComponentForm);