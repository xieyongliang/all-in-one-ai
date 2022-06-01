import { FunctionComponent, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { FormSection, FormField, Input, Button, Text, Stack, Form } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';
import Select, { SelectOption } from 'aws-northstar/components/Select';
import { UpdateEndpointInitialInstanceCount, UpdateEndpointInstanceType, UpdateEndpointName, UpdateModelEnvironment, UpdateModelName } from '../../../store/pipelines/actionCreators';
import { ENDPOINTOPTIONS } from '../../Data/data'

interface IProps {
    updateModelNameAction: (modelName: string) => any;
    updateModelEnvironmentAction: (modelEnvironment: any[]) => any;
    updateEndpointNameAction: (endpointName: string) => any;
    updateEndpointInstanceTypeAction: (instanceType: string) => any;
    updateEndpointInstanceCountAction: (instanceCount: number) => any;
    industrialModels : IIndustrialModel[];
    modelName: string;
    modelEnvironment: any[];
    endpointName: string;
    endpointInstanceType: string;
    endpointInstanceCount: number;
    wizard?: boolean;
}

const DeployForm: FunctionComponent<IProps> = (props) => {
    const [ modelName, setModelName ] = useState(props.wizard ? props.modelName : '')
    const [ modelData, setModelData ] = useState('')
    const [ endpointName, setEndpointName ] = useState(props.wizard ? props.endpointName : '')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.endpointInstanceType, value: props.endpointInstanceType} : {})
    const [ instanceCount, setInstanceCount ] = useState(props.wizard ? props.endpointInstanceCount : 1)
    const [ processing, setProcessing ] = useState(false)
    const [ environments, setEnvironments ] = useState([])

    const history = useHistory();

    var params : PathParams = useParams();
    
    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdModelName') {
            setModelName(event);
            if(props.wizard)
                props.updateModelNameAction(event)
        }
        else if(id === 'formFieldIdModelData')
            setModelData(event);
        else if(id === 'formFieldIdEndpointName') {
            setEndpointName(event);
            if(props.wizard)
                props.updateEndpointNameAction(event)
        }
        else if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({label: event.target.value, value: event.target.value})
            if(props.wizard)
                props.updateEndpointInstanceTypeAction(event.target.value)
        }
        else if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(event)
            if(props.wizard)
                props.updateEndpointInstanceCountAction(event)
        }
    }

    const onSubmit = () => {
        var body = {}
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm

        body = {
                'model_name': modelName,
                'model_data_url' : modelData,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'model_environment': '{}',
                'endpoint_name': endpointName,
                'instance_type': selectedInstanceType.value,
                'initial_instance_count': instanceCount
            }

        if(environments.length > 0) {
            var environment = {}
            environments.forEach((item) => {
                    environment[item['key']] = item['value'];
                })
                body['model_environment'] = JSON.stringify(environment)
            }
                
            setProcessing(true)
            axios.post('/deploy', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    setProcessing(false)
                    console.log(error);
                }
            );
    }
 
    const onCancel = () => {
        history.goBack()
    }

    const renderDeploySetting = () => {
        return (
            <FormSection header='Deploy settings'>
                <FormField label='Model name' controlId='formFieldIdModelName'>
                    <Input type='text' required={true} value={modelName} onChange={(event)=>onChange('formFieldIdModelName', event)}/>
                </FormField>
                {
                    !props.wizard && 
                    <FormField label='Model data' controlId='formFieldIdModelData'>
                        <Input type='text' required={true} value={modelData} onChange={(event)=>onChange('formFieldIdModelData', event)}/>
                    </FormField>
                }
                <FormField label='Endpoint name' controlId='formFieldIdEndpointName'>
                    <Input type='text' required={true} value={endpointName} onChange={(event)=>onChange('formFieldIdEndpointName', event)}/>
                </FormField>
                <FormField label='Instance type' controlId='formFieldIdInstanceType'>
                    <Select
                        placeholder='Choose an option'
                        options={ ENDPOINTOPTIONS }
                        selectedOption={selectedInstanceType}
                        onChange={(event) => onChange('formFieldIdInstanceType', event)}
                    />
                </FormField>
                <FormField label='Instance count' controlId='formFieldIdInstanceCount'>
                    <Input type='number' value={instanceCount} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                </FormField>
                { renderEnvironment() }
            </FormSection>
        )
    }

    const onAddEnvironmentVairable = () => {
        var copyEnvironmentVaraibles = JSON.parse(JSON.stringify(environments));
        copyEnvironmentVaraibles.push({key:'', value:''});
        setEnvironments(copyEnvironmentVaraibles);
    }

    const onRemoveEnvironmentVariable = (index) => {
        var copyEnvironmentVaraibles = JSON.parse(JSON.stringify(environments));
        copyEnvironmentVaraibles.splice(index, 1);
        setEnvironments(copyEnvironmentVaraibles);
    }

    const onChangeEnvironment = (id: string, event: any, index : number) => {
        if(id === 'key')
            environments[index].key = event
        else
            environments[index].value = event
        props.updateModelEnvironmentAction(environments)
    }

    const renderEnvironment = () => {
        return (
                <Stack>
                    {
                        environments.length > 0 && 
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Key </Text>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Value </Text> 
                            </Grid>
                        </Grid>
                    }
                    {
                        environments.length > 0 && 
                        environments.map((item, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.key} onChange={(event) => onChangeEnvironment('key', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.value} onChange={(event) => onChangeEnvironment('value', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveEnvironmentVariable(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddEnvironmentVairable}>Add environment variable</Button>
                </Stack>            
        )
    }

    if(props.wizard) {
        return (
            renderDeploySetting()
        )
    }
    else
        return (
            <Form
                header='Create deploy'
                description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                    </div>
                }>            
                { renderDeploySetting() }
            </Form>
        )
}

const mapDispatchToProps = {
    updateModelNameAction: UpdateModelName,
    updateModelEnvironmentAction: UpdateModelEnvironment,
    updateEndpointNameAction: UpdateEndpointName,
    updateEndpointInstanceTypeAction: UpdateEndpointInstanceType,
    updateEndpointInstanceCountAction: UpdateEndpointInitialInstanceCount
};

const mapStateToProps = (state: AppState) => ({
    modelName: state.pipeline.modelName,
    modelEnvironment: state.pipeline.modelEnvironment,
    endpointName: state.pipeline.endpointName,
    endpointInstanceType: state.pipeline.endpointInstanceType,
    endpointInstanceCount: state.pipeline.endpointInitialInstanceCount,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeployForm);