import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Button, Text, Input, Stack, Select } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { UpdateEndpointAcceleratorType, UpdateEndpointInitialInstanceCount, UpdateEndpointInitialVariantWeight, UpdateEndpointInstanceType } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';
import { ENDPOINTOPTIONS, ACCELERALATOROPTIONS } from '../../Data/data'
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

interface IProps {
    updateEndpointInstanceTypeAction: (endpointInstanceType: string) => any;
    updateEndpointAcceleratorTypeAction: (endpointAcceleratorType: string) => any;
    updateEndpointInitialInstanceCountAction: (endpointInitialInstanceCount: number) => any,
    updateEndpointInitialVariantWeightAction: (endpointInitialVariantWeight: number) => any
    endpointInstanceType : string;
    endpointAcceleratorType: string;
    endpointInitialInstanceCount: number;
    endpointInitialVariantWeight: number;
    industrialModels : IIndustrialModel[];
    wizard?: boolean;
}

const EndpointForm: FunctionComponent<IProps> = (props) => {
    const [ modelOptions, setModelOptions ] = useState([])
    const [ endpointName, setEndpointName ] = useState(''); 
    const [ selectedModelName, setSelectedModelName ] = useState<SelectOption>({});
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.endpointInstanceType, value: props.endpointInstanceType} : {});
    const [ selectedAcceleratorTypeType, setSelectedAcceleratorTypeType ] = useState<SelectOption>(props.wizard ? {label: props.endpointAcceleratorType, value: props.endpointAcceleratorType} : {});
    const [ initialInstanceCount, setInitialInstanceCount ] = useState<number>(props.wizard ? props.endpointInitialInstanceCount : 1);
    const [ initialVariantWeight, setInitialVariantWeight ] = useState<number>(props.wizard ? props.endpointInitialVariantWeight : 1);
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ processing, setProcessing ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/model', {params : {industrial_model: params.id}})
            .then((response) => {
                var items = []
                for(let item of response.data) {
                    items.push({label: item.ModelName, value: item.ModelName})
                    if(items.length === response.data.length)
                        setModelOptions(items);
                }
            }, (error) => {
                console.log(error);
            });
    }, [params.id])

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdEndpointName')
            setEndpointName(event)
        if(id === 'formFieldIdModelName') {
            setSelectedModelName({label: event.target.value, value: event.target.value});
        }
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({label: event.target.value, value: event.target.value});
            props.updateEndpointInstanceTypeAction(event.target.value)
        }
        if(id === 'formFieldIdAcceleratorType') {
            setSelectedAcceleratorTypeType({label: event.target.value, value: event.target.value});
            props.updateEndpointAcceleratorTypeAction(event.target.value)
        }
        if(id === 'formFieldIdInitialInstanceCount') {
            setInitialInstanceCount(parseInt(event))
            props.updateEndpointInitialInstanceCountAction(parseInt(event))
        }
        if(id === 'formFieldIdInitialVariantWeight') {
            setInitialVariantWeight(parseFloat(event))
            props.updateEndpointInitialVariantWeightAction(event)
        }
    }

    const onSubmit = () => {
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm

        var body = {
            'endpoint_name': endpointName,
            'model_name' : selectedModelName.value,
            'industrial_model': params.id,
            'model_algorithm': algorithm,
            'instance_type': selectedInstanceType.value,
            'accelerator_type': selectedAcceleratorTypeType.value === 'none' ? '': selectedAcceleratorTypeType.value,
            'initial_instance_count': initialInstanceCount,
            'initial_variant_weight': initialVariantWeight
        }
        if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
            body['tags'] = tags
        setProcessing(true)
        axios.post('/endpoint', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.goBack()
            }, (error) => {
                alert(t('industrial_models.common.error_occured'));
                console.log(error);
                setProcessing(false)
            });
    }

    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags.push({key:'', value:''});
        setTags(copyTags);
    }

    const onRemoveTag = (index) => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags.splice(index, 1);
        setTags(copyTags);
    }

    const onChangeTags = (id: string, event: any, index : number) => {
        var copyTags = JSON.parse(JSON.stringify(tags));
        copyTags[index][id] = event
        setTags(copyTags)
    }    

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderEndpointSetting = () => {
        return (
            <FormSection header={t('industrial_models.endpoint.endpoint_settings')}>
                <FormField label={t('industrial_models.endpoint.endpoint_name')} description={t('industrial_models.endpoint.endpoint_name_description')} controlId={uuidv4()} hintText={t('industrial_models.endpoint.endpoint_name_hint')}>
                    <Input type='text' value={endpointName} onChange={(event) => {onChange('formFieldIdEndpointName', event)}} />
                </FormField>
            </FormSection>
        )
    }

    const renderEndpointTag = () => {
        if(!wizard) {
            return (
                <FormSection header={t('industrial_models.common.tags')}>
                    {
                        tags.length>0 && 
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> {t('industrial_models.common.key')} </Text>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> {t('industrial_models.common.value')} </Text> 
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text>  </Text>
                                </Grid>
                            </Grid>
                    }
                    {
                        tags.map((tag, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.key} onChange={(event) => onChangeTags('key', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.value} onChange={(event) => onChangeTags('value', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveTag(index)}>{t('industrial_models.common.remove')}</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddTag}>{t('industrial_models.common.add_tag')}</Button>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderEndpointFormContent = () => {
        return (
            <FormSection header={t('industrial_models.endpoint.production_variant')} >
                {   !wizard && 
                    <FormField label={t('industrial_models.endpoint.model_name')} controlId={uuidv4()}>
                        <Select
                                options={modelOptions}
                                selectedOption={selectedModelName}
                                onChange={(event) => onChange('formFieldIdModelName', event)}
                            />
                    </FormField>
                }
                <FormField label={t('industrial_models.endpoint.instance_type')} controlId={uuidv4()}>
                    <Select
                            options={ ENDPOINTOPTIONS }
                            selectedOption={selectedInstanceType}
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                </FormField>
                <FormField label={t('industrial_models.endpoint.elastic_inference')} controlId={uuidv4()}>
                    <Select
                            options={ ACCELERALATOROPTIONS }
                            selectedOption={selectedAcceleratorTypeType}
                            onChange={(event) => onChange('formFieldIdAcceleratorType', event)}
                        />
                </FormField>
                <FormField label={t('industrial_models.endpoint.initial_instance_count')} controlId={uuidv4()}>
                    <Input type='text' value={initialInstanceCount} onChange={(event) => {onChange('formFieldIdInitialInstanceCount', event)}} />
                </FormField>
                <FormField label={t('industrial_models.endpoint.initial_weight')} controlId={uuidv4()}>
                    <Input type='text' value={initialVariantWeight} onChange={(event) => {onChange('formFieldIdInitialVariantWeight', event)}} />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header={t('industrial_models.endpoint.create_endpoint')}
                description={t('industrial_models.endpoint.create_endpoint_description')}
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
                    </div>
                }>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateEndpointInstanceTypeAction: UpdateEndpointInstanceType,
    updateEndpointAcceleratorTypeAction: UpdateEndpointAcceleratorType,
    updateEndpointInitialInstanceCountAction: UpdateEndpointInitialInstanceCount,
    updateEndpointInitialVariantWeightAction: UpdateEndpointInitialVariantWeight
};

const mapStateToProps = (state: AppState) => ({
    endpointInstanceType : state.pipeline.endpointInstanceType,
    endpointAcceleratorType: state.pipeline.endpointAcceleratorType,
    endpointInitialInstanceCount: state.pipeline.endpointInitialInstanceCount,
    endpointInitialVariantWeight: state.pipeline.endpointInitialVariantWeight,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EndpointForm);