import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Stack, Select, Input } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { UpdateGreengrassComponentName, UpdateGreengrassComponentVersion } from '../../../store/pipelines/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

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
    const [ itemsModel ] = useState({})
    const [ processing, setProcessing ] = useState(false)

    const { t } = useTranslation();

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
            logOutput('error', error.response.data, undefined, error);
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
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false);             
            })
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
            <FormSection header={t('industrial_models.greengrass_component.greengrass_component_settings')}>
                <FormField label={t('industrial_models.greengrass_component.component_name')} controlId={uuidv4()}>
                    <Select
                            options={optionsComponents}
                            selectedOption={selectedComponent}
                            onChange={(event) => onChange('formFieldIdComponents', event)}
                        />
                    </FormField>
                </FormSection>
            )
    }

    const renderGreengrassContent = () => {
        if(!wizard)
            return (
                <FormSection header={t('industrial_models.greengrass_component.production_variant')}>
                    <FormField label={t('industrial_models.greengrass_component.model_name')} controlId={uuidv4()}>
                        <Select
                                options={optionsModels}
                                selectedOption={selectedModel}
                                onChange={(event) => onChange('formFieldIdModels', event)}
                            />
                    </FormField>
                    <FormField label={t('industrial_models.greengrass_component.component_version')} controlId={uuidv4()}>
                        <Input value={componentVersion} onChange={(event) => onChange('formFieldIdMComponentVersion', event)} />
                    </FormField>
                </FormSection>
            )
        else
            return (
                <FormSection header={t('industrial_models.greengrass_component.production_variant')}>
                    <FormField label={t('industrial_models.greengrass_component.component_version')} controlId={uuidv4()}>
                        <Input value={componentVersion} onChange={(event) => onChange('formFieldIdMComponentVersion', event)} />
                    </FormField>
                </FormSection>
            )
    }

    if(wizard) {
        return (
            <Stack>
                { renderGreengrassContent() }
            </Stack>
        )
    }
    else {
        return (
            <Form
                header={t('industrial_models.greengrass_component.create_greengrass_component')}
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
                    </div>
                }>
                { renderGreengrassComponentSetting() }
                { renderGreengrassContent() }
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