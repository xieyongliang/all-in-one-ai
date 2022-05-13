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

const instanceOptions : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.t2.medium', value: 'ml.t2.medium' }, 
            { label: 'ml.t2.large', value: 'ml.t2.large' }, 
            { label: 'ml.t2.xlarge', value: 'ml.t2.xlarge' }, 
            { label: 'ml.t2.2xlarge', value: 'ml.t2.2xlarge' }, 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m5d.large', value: 'ml.m5d.large' }, 
            { label: 'ml.m5d.xlarge', value: 'ml.m5d.xlarge' }, 
            { label: 'ml.m5d.2xlarge', value: 'ml.m5d.2xlarge' }, 
            { label: 'ml.m5d.4xlarge', value: 'ml.m5d.4xlarge' }, 
            { label: 'ml.m5d.12large', value: 'ml.m5d.12large' }, 
            { label: 'ml.m5d.24xlarge', value: 'ml.m5d.24xlarge' }, 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' },
            { label: 'ml.c4.large', value: 'ml.c4.large' },
            { label: 'ml.c4.xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' },
            { label: 'ml.c5d.large', value: 'ml.c5d.large' },
            { label: 'ml.c5d.xlarge', value: 'ml.c5d.xlarge' },
            { label: 'ml.c5d.2xlarge', value: 'ml.c5d.2xlarge' },
            { label: 'ml.c5d.4xlarge', value: 'ml.c5d.4xlarge' },
            { label: 'ml.c5d.9xlarge', value: 'ml.c5d.9xlarge' },
            { label: 'ml.c5d.18xlarge', value: 'ml.c5d.18xlarge' }
        ]
    },
    {
        label: 'Memory optimized', 
        options: [ 
            { label: 'ml.r5.large', value: 'ml.r5.large' },
            { label: 'ml.r5.xlarge', value: 'ml.r5.xlarge' },
            { label: 'ml.r5.2xlarge', value: 'ml.r5.2xlarge' },
            { label: 'ml.r5.4xlarge', value: 'ml.r5.4xlarge' },
            { label: 'ml.r5.12xlarge', value: 'ml.r5.12xlarge' },
            { label: 'ml.r5.24xlarge', value: 'ml.r5.24xlarge' },
            { label: 'ml.r5d.large', value: 'ml.r5d.large' },
            { label: 'ml.r5d.xlarge', value: 'ml.r5d.xlarge' },
            { label: 'ml.r5d.2xlarge', value: 'ml.r5d.2xlarge' },
            { label: 'ml.r5d.4xlarge', value: 'ml.r5d.4xlarge' },
            { label: 'ml.r5d.12xlarge', value: 'ml.r5d.12xlarge' },
            { label: 'ml.r5d.24xlarge', value: 'ml.r5d.24xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' },
            { label: 'ml.g4dn.xlarge', value: 'ml.g4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' },
            { label: 'ml.inf1.xlarge', value: 'ml.inf1.xlarge' },
            { label: 'ml.inf1.2xlarge', value: 'ml.inf1.2xlarge' },
            { label: 'ml.inf1.6xlarge', value: 'ml.inf1.6xlarge' },
            { label: 'ml.inf1.24xlarge', value: 'ml.inf1.24xlarge' },
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
        ]
    }
];

interface IProps {
    industrialModels : IIndustrialModel[];
    wizard?: boolean;
}

const DeployForm: FunctionComponent<IProps> = (props) => {
    const [ modelName, setModelName ] = useState('')
    const [ modelData, setModelData ] = useState('')
    const [ endpointName, setEndpointName ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>({})
    const [ instanceCount, setInstanceCount ] = useState(1)
    const [ processing, setProcessing ] = useState(false)
    const [ environments, setEnvironments ] = useState([])

    const history = useHistory();

    var params : PathParams = useParams();
    
    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdModelName')
            setModelName(event);
        else if(id === 'formFieldIdModelData')
            setModelData(event);
        else if(id === 'formFieldIdEndpointName')
            setEndpointName(event);
        else if(id === 'formFieldIdInstanceType')
            setSelectedInstanceType({label: event.target.value, value: event.target.value})
        else if(id === 'formFieldIdInstanceCount')
            setInstanceCount(event)
    }

    const onSubmit = () => {
        var body = {}
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm

        body = {
                'model_name': modelName,
                'model_data' : modelData,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'endpoint_name': endpointName,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount
            }

        if(environments.length > 0) {
            var environment = {}
            environments.forEach((item) => {
                    if(item['key'] === '') {
                        alert('key in environment variables cannot be empty');
                        return;
                    }
                    environment[item['key']] = item['value'];
                })
                body['environment'] = JSON.stringify(environment)
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
                <FormField label='Model data' controlId='formFieldIdModelData'>
                    <Input type='text' required={true} value={modelData} onChange={(event)=>onChange('formFieldIdModelData', event)}/>
                </FormField>
                <FormField label='Endpoint name' controlId='formFieldIdEndpointName'>
                    <Input type='text' required={true} value={endpointName} onChange={(event)=>onChange('formFieldIdEndpointName', event)}/>
                </FormField>
                <FormField label='Instance type' controlId='formFieldIdInstanceType'>
                    <Select
                        placeholder='Choose an option'
                        options={instanceOptions}
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
        var copyEnvironment = JSON.parse(JSON.stringify(environments));
        copyEnvironment[index][id] = event
        setEnvironments(copyEnvironment)
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

const mapStateToProps = (state: AppState) => ({
    pipelineType: state.pipeline.pipelineType,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(DeployForm);