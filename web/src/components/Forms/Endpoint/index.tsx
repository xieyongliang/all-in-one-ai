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
                alert('Error occured, please check and try it again');
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
        if(!wizard) {
            return (
                <FormSection header='Endpoint setting'>
                    <FormField label='Endpooint name' description='Your application uses this name to access this endpoint.' controlId={uuidv4()} hintText='Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.'>
                        <Input type='text' value={endpointName} onChange={(event) => {onChange('formFieldIdEndpointName', event)}} />
                    </FormField>
                </FormSection>
            )
        }
        else 
            return ''
    }

    const renderEndpointTag = () => {
        if(!wizard) {
            return (
                <FormSection header='Tags - optional'>
                    {
                        tags.length>0 && 
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Key </Text>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Value </Text> 
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
                                    <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddTag}>Add tag</Button>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderEndpointFormContent = () => {
        return (
            <FormSection header='Production variants'>
                {   !wizard && 
                    <FormField label='Model name' controlId={uuidv4()}>
                        <Select
                                placeholder='Choose an option'
                                options={modelOptions}
                                selectedOption={selectedModelName}
                                onChange={(event) => onChange('formFieldIdModelName', event)}
                            />
                    </FormField>
                }
                <FormField label='Instance type' controlId={uuidv4()}>
                    <Select
                            placeholder='Choose an option'
                            options={ ENDPOINTOPTIONS }
                            selectedOption={selectedInstanceType}
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                </FormField>
                <FormField label='Elastic Inference' controlId={uuidv4()}>
                    <Select
                            placeholder='Choose an option'
                            options={ ACCELERALATOROPTIONS }
                            selectedOption={selectedAcceleratorTypeType}
                            onChange={(event) => onChange('formFieldIdAcceleratorType', event)}
                        />
                </FormField>
                <FormField label='Initial instance count' controlId={uuidv4()}>
                    <Input type='text' value={initialInstanceCount} onChange={(event) => {onChange('formFieldIdInitialInstanceCount', event)}} />
                </FormField>
                <FormField label='Initial weight' controlId={uuidv4()}>
                    <Input type='text' value={initialVariantWeight} onChange={(event) => {onChange('formFieldIdInitialVariantWeight', event)}} />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderEndpointSetting()}
                {renderEndpointFormContent()}
                {renderEndpointTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create endpoint'
                description='To deploy models to Amazon SageMaker, first create an endpoint. Specify which models to deploy, and the relative traffic weighting and hardware requirements for each. '
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
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