import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Stack, Text, RadioGroup, RadioButton, Toggle } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import {connect} from 'react-redux';
import { AppState } from '../../../store';
import { UpdateTrainingjobInputData, UpdateTrainingjobInstanceCount, UpdateTrainingjobInstanceType, UpdateTrainingjobVolumeSizeInGB, UpdateTrainingjobOutputS3Uri, UpdateTrainingjobHyperparameters } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';
import { TRAININGINPUTDATA, TRAININGOPTIONS } from '../../Data/data';
import { v4 as uuidv4 } from 'uuid';
import './index.scss';
import { useTranslation } from "react-i18next";

interface IProps {
    updateTrainingjobInstanceTypeAction: (trainingjobInstanceType: string) => any;
    updateTrainingjobInstanceCountAction: (trainingjobInstanceCount: number) => any;
    updateTrainingjobVolumeSizeInGBAction: (trainingjobVolumeSizeInGB: number) => any;
    updateTrainingjobHyperparametersAction: (hyperparameters: any[]) => any;
    updateTrainingjobInputDataAction: (trainingjobInputData: any[]) => any;
    updateTrainingjobOutputS3UriAction: (trainingjobOutputS3Uri: string) => any;
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobVolumeSizeInGB : number;
    trainingjobHyperparameters: any[];
    trainingjobInputData : any[];
    trainingjobOutputS3Uri : string;
    scriptMode: boolean;
    industrialModels: IIndustrialModel[];
    industrialModel: string;
    wizard?: boolean;
}

const TrainingJobForm: FunctionComponent<IProps> = (props) => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ trainingImage, setTrainingImage ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.trainingjobInstanceType, value: props.trainingjobInstanceType} : {})
    const [ instanceCount, setInstanceCount ] = useState(props.wizard ? props.trainingjobInstanceCount : 1)
    const [ volumeSizeInGB, setVolumeSizeInGB ] = useState(props.wizard ? props.trainingjobVolumeSizeInGB : 30)
    const [ outputS3Uri, setOutputS3Uri ] = useState(props.wizard ? props.trainingjobOutputS3Uri : '')
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ processing, setProcessing ] = useState(false)
    const [ scriptMode, setScriptMode ]  = useState(props.wizard ? props.scriptMode : true)
    const [ hyperparameters, setHyperParameters ] = useState(props.wizard? props.trainingjobHyperparameters : [])
    const [ checkpointS3Uri, setCheckpointS3Uri ] = useState('')
    const [ checkpointLocalPath, setCheckpointLocalPath ] = useState('')
    const [ enableManagedSpotTraining, setEnableManagedSpotTraining ] = useState(false)
    const [ selectedWaitiUnit, setSelectedWaitUnit ] = useState<SelectOption>({label: 'hours', value: 'hours'})
    const [ maxWaitTime, setMaxWaitTime ] = useState(48)
    const [ selectedRuntimeUnit, setRuntimeUnit ] = useState<SelectOption>({label: 'hours', value: 'hours'})
    const [ maxRuntime, setMaxRuntime ] = useState(24)

    const { t } = useTranslation();

    const timeUnitOptions : SelectOption[] = [
        {
            label: t('industrial_models.common.seconds'),
            value: 'seconds'
        },
        {
            label: t('industrial_models.common.minutes'),
            value: 'minutes'
        },
        {
            label: t('industrial_models.common.hours'),
            value: 'hours'
        },
        {
            label: t('industrial_models.common.days'),
            value: 'days'
        }
    ]

    const history = useHistory();

    var params : PathParams = useParams();
    var industrialModel = props.wizard ? props.industrialModels.find((item) => item.id === props.industrialModel) : props.industrialModels.find((item) => item.id === params.id);
    var algorithm = industrialModel.algorithm;
    const [ inputData ] = useState(TRAININGINPUTDATA[algorithm]);

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdTrainingJobName') {
            setTrainingJobName(event);
        }
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
            if(props.wizard)
                props.updateTrainingjobInstanceTypeAction(event.target.value);
        }
        if(id === 'formFieldIdTrainingImage')
            setTrainingImage(event);
        if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(parseInt(event));
            if(props.wizard)
                props.updateTrainingjobInstanceCountAction(parseInt(event));
        }
        if(id === 'formFieldIdVolumeSizeInGB') {
            setVolumeSizeInGB(parseInt(event));
            if(props.wizard)
                props.updateTrainingjobVolumeSizeInGBAction(parseInt(event));
        }
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobOutputS3UriAction(event)
        }
        if(id === 'formFieldIdStopMaxRuntimeTime') {
            setMaxRuntime(event)
        }
        if(id === 'formFieldIdStopRuntimeUnit') {
            setRuntimeUnit({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdCheckpointLocalPath') {
            setCheckpointLocalPath(event)
        }
        if(id === 'formFieldIdCheckpointS3Uri') {
            setCheckpointS3Uri(event)
        }
        if(id === 'formFieldIdSpotTrainingMaxWaitTime') {
            setMaxWaitTime(event)
        }
        if(id === 'formFieldIdSpotTrainingUnit') {
            setSelectedWaitUnit({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdSpotTrainingEnabled') {
            setEnableManagedSpotTraining(event)
        }
    }

    const onChangeHyperparameters = (index, id, event) => {
        if(id === 'key')
            hyperparameters[index].key = event
        else
            hyperparameters[index].value = event
        props.updateTrainingjobHyperparametersAction(hyperparameters)   
    }

    const onChangeInputData = (id, event) => {
        var channel = inputData.find((channel) => channel.key === id)
        channel.value = event
        props.updateTrainingjobInputDataAction(inputData)
    }

    const onSubmit = () => {            
        if(!scriptMode) {
            var maxRuntimeInSeconds = maxRuntime
            if(selectedRuntimeUnit === 'Days')
                maxRuntimeInSeconds *= 24 * 60 * 60
            else if(selectedRuntimeUnit === 'Hours')
                maxRuntimeInSeconds *= 60 * 60
            else if(selectedRuntimeUnit === 'Minutes')
                maxRuntimeInSeconds *= 60
            var maxWaitTimeInSeconds = maxWaitTime
            if(selectedWaitiUnit === 'Days')
                maxWaitTimeInSeconds *= 24 * 60 * 60
            else if(selectedWaitiUnit === 'Hours')
                maxWaitTimeInSeconds *= 60 * 60
            else if(selectedWaitiUnit === 'Minutes')
                maxWaitTimeInSeconds *= 60
            var body1 = {
                'training_job_name' : trainingJobName,
                'training_image': trainingImage,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'volume_size_in_gb': volumeSizeInGB,
                'output_s3uri': outputS3Uri,
                'inputs': {},
                'checkpoint_s3uri': checkpointS3Uri,
                'checkpoint_localpath': checkpointLocalPath,
                'enable_managed_spot_training': enableManagedSpotTraining,
                'max_waittime_in_seconds': maxWaitTimeInSeconds,
                'max_runtime_in_seconds': maxRuntimeInSeconds
            }
            inputData.forEach((channel) => {
                var key = channel.key;
                var value = channel.value;
                if(value !== '')
                    body1['inputs'][key] = value;
            });
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body1['tags'] = tags
            setProcessing(true)
            axios.post('/trainingjob', body1,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                        alert(t('industrial_models.common.error_occured'));
                        console.log(error);
                        setProcessing(false);
                    }
                );
        }
        else {
            var body2 = {
                'training_job_name' : trainingJobName,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'inputs': {},
                'model_hyperparameters' : {}
            }
            inputData.forEach((channel) => {
                var key = channel.key;
                var value = channel.value;
                if(key !== '' && value !== '')
                    body2['inputs'][key] = value
            });
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body2['tags'] = tags
            hyperparameters.forEach((hyperparameter) => {
                body2['model_hyperparameters'][hyperparameter.key] = hyperparameter.value
            })
            setProcessing(true)
            axios.post('/train', body2,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                        alert(t('industrial_models.common.error_occured'));
                        console.log(error);
                        setProcessing(false);
                    }
                );
        }
    }

    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        var copyTags = JSON.parse(JSON.stringify(tags))
        copyTags.push({key:'', value:''});
        setTags(copyTags);
    }

    const onRemoveTag = (index) => {
        var copyTags = JSON.parse(JSON.stringify(tags))
        copyTags.splice(index, 1);
        setTags(copyTags);
    }

    const onAddHyperparameter = () => {
        var copyHyperparameters = JSON.parse(JSON.stringify(hyperparameters))
        copyHyperparameters.push({key:'', value:''});
        setHyperParameters(copyHyperparameters)
    }

    const onRemoveHyperparameter = (index) => {
        var copyHyperparameters = JSON.parse(JSON.stringify(hyperparameters))
        copyHyperparameters.splice(index, 1);
        setHyperParameters(copyHyperparameters)
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const onChangeOptions = (event) => {
        setScriptMode(event.target.value === 'BYOS')
    }

    const renderTrainingJobSetting = () => {
        return (
            <FormSection header={t('industrial_models.training_job.job_settings')}>
                {
                    (!wizard) && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>{t('industrial_models.training_job.job_name')}</Text>
                            <div style={{marginTop: '5px'}}>
                                <Input type='text' value={trainingJobName} required={true} onChange={(event) => onChange('formFieldIdTrainingJobName', event)}/>
                            </div>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}></Grid>
                        <Grid item xs={2} sm={8} md={8}>
                            <div style={{marginTop: '-22px'}}>
                                <Text variant='small'>{t('industrial_models.training_job.job_name_hint')}</Text>
                            </div>
                        </Grid>
                    </Grid>
                }
                {
                    !wizard && 
                    <div className='subheader'>
                        <div className='title'>
                            {t('industrial_models.training_job.algorithm_specification')}
                        </div>
                    </div>
                }
                {
                    !wizard && 
                    <div style={{marginBottom: '5px'}}>
                        <FormField controlId={uuidv4()} description={t('industrial_models.training_job.algorithm_container_options')}>
                            <RadioGroup onChange={onChangeOptions}
                                items={[
                                    <RadioButton value='BYOS' checked={scriptMode}>{t('industrial_models.training_job.algorithm_container_option_byos')}</RadioButton>, 
                                    <RadioButton value='BYOC' checked={!scriptMode}>{t('industrial_models.training_job.algorithm_container_option_byoc')}</RadioButton>,
                                ]}
                            /> 
                        </FormField>
                    </div>
                }
                {
                    !scriptMode &&
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>{t('industrial_models.common.container')}</Text>
                            <div style={{marginTop: '5px', marginBottom: '5px'}}>
                                <Input type='text' required={true} onChange={(event) => onChange('formFieldIdTrainingImage', event)}/>
                            </div>
                        </Grid>
                    </Grid>
                }
                <div className='subheader'>
                    <div className='title'>
                        {t('industrial_models.training_job.resource_configuration')}
                    </div>
                </div>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>{t('industrial_models.training_job.instance_type')}</Text>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>{t('industrial_models.training_job.instance_count')}</Text>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}/>
                    <Grid item xs={2} sm={2} md={2}>
                    <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                            <Select
                                options={ TRAININGOPTIONS }
                                selectedOption={selectedInstanceType}
                                onChange={(event) => onChange('formFieldIdInstanceType', event)}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                            <Input type='number' value={instanceCount} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}/>
                    {
                        !scriptMode && 
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>{t('industrial_models.training_job.additional_storage_volume_in_gb')}</Text>
                            <div style={{marginTop: '5px', marginBottom: '5px'}}>
                                <Input type='number' value={volumeSizeInGB} required={true} onChange={(event) => onChange('formFieldIdVolumeSizeInGB', event)}/>
                            </div>
                        </Grid>
                    }
                </Grid>
                {
                    scriptMode && <div style={{margin: '15px'}}/>
                }
                {
                    !scriptMode && 
                    <div className='subheader'>
                        <div className='title'>
                            {t('industrial_models.training_job.stop_condiction')}
                        </div>
                    </div>
                }
                {
                    !scriptMode && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={8} md={8}>
                            <Text>{t('industrial_models.training_job.maximum_runtime')}</Text>
                        </Grid>
                        <Grid item xs={2} sm={3} md={3}>
                            <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                                <Input type='number' value={maxRuntime} required={true} onChange={(event) => onChange('formFieldIdStopMaxRuntimeTime', event)}/>
                            </div>
                        </Grid>
                        <Grid item xs={2} sm={1} md={1}>
                            <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                                <Select
                                    options={timeUnitOptions}
                                    selectedOption={selectedRuntimeUnit}
                                    onChange={(event) => onChange('formFieldIdStopRuntimeUnit', event)}
                                />
                            </div>
                        </Grid>
                    </Grid>
                }
            </FormSection>
        )
    }

    const renderHyperparameters = () => {
        return (
            <FormSection header={t('industrial_models.training_job.hyperparameters')} description={t('industrial_models.training_job.hyperparameters_description')}>
                {
                    hyperparameters.length>0 && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> {t('industrial_models.common.key')} </Text>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> {t('industrial_models.common.value')} </Text> 
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                        </Grid>
                    </Grid>
                }
                {
                    hyperparameters.map((hyperparameter, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={hyperparameter.key} onChange={(event) => onChangeHyperparameters(index, 'key', event)}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={hyperparameter.value} onChange={(event) => onChangeHyperparameters(index, 'value', event)}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Button onClick={() => onRemoveHyperparameter(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddHyperparameter}>{t('industrial_models.training_job.add_hyperparameter')}</Button>
            </FormSection>
        )
    }

    const renderInputDataConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.training_job.input_data_configuration')} description={t('industrial_models.training_job.input_data_configuration_description')}>
                {
                    inputData.map((channel, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={1} md={1}>
                                <Text> {channel.key} </Text>
                            </Grid>
                            <Grid item xs={2} sm={3} md={3}>
                                <Input type='text' value={channel.value} onChange={(event)=>onChangeInputData(channel.key, event)}/>
                            </Grid>
                        </Grid>
                    ))
                }
            </FormSection>
        )
    }

    const renderCheckpointConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.training_job.checkpoint_configuration')} description={t('industrial_models.training_job.checkpoint_configuration_description')}>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Text variant='p'>{t('industrial_models.training_job.s3_location')}</Text>
                        <div style={{marginTop: '5px'}}/>
                        <Input value={checkpointS3Uri} placeholder='s3://{bucket}/path-to-your-data' required={true} onChange={(event) => onChange('formFieldIdCheckpointS3Uri', event)} />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} />
                    <Grid item xs={2} sm={4} md={4}>
                        <Text variant='p'>{t('industrial_models.training_job.local_path')}</Text>
                        <Text variant='small'>{t('industrial_models.training_job.local_path_description')}</Text>
                        <div style={{marginTop: '5px'}}/>
                        <Input value={checkpointLocalPath} onChange={(event) => onChange('formFieldIdCheckpointLocalPath', event)} />
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutputDataConfiguration = () => {
            return (
                <FormSection header={t('industrial_models.training_job.output_data_configuration')}>
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Input value={outputS3Uri} placeholder='s3://{bucket}/path-to-your-data' required={true} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)} />
                        </Grid>
                    </Grid>
                </FormSection>
        )
    }

    const renderManagedSpotTraining = () => {
        return (
            <FormSection header={t('industrial_models.training_job.managed_spot_training')}>
                <FormField controlId={uuidv4()}>
                <Toggle label={t('industrial_models.training_job.enable_managed_spot_training')} description={t('industrial_models.training_job.enable_managed_spot_training_description')} onChange={(event) => onChange('formFieldIdSpotTrainingEnabled', event)} />   
                </FormField>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Text variant='p'>{t('industrial_models.training_job.maximum_wait_time')}</Text>
                        <Text variant='small'>{t('industrial_models.training_job.maximum_wait_time_description')}</Text>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '5px', marginBottom: '5px'}}>
                            <Input value={maxWaitTime} disabled={!enableManagedSpotTraining} required={true} onChange={(event) => onChange('formFieldIdSpotTrainingMaxWaitTime', event)} />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '5px', marginBottom: '5px'}}>
                            <Select
                                options={timeUnitOptions}
                                selectedOption={selectedWaitiUnit}
                                onChange={(event) => onChange('formFieldIdSpotTrainingUnit', event)}
                                disabled={!enableManagedSpotTraining}
                            />
                        </div>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTrainingJobTag = () => {
        return (
            <FormSection header={t('industrial_models.common.tags')}>
                {
                    tags.length>0 && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text> {t('industrial_models.common.key')} </Text>
                        </Grid>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text> {t('industrial_models.common.value')} </Text> 
                        </Grid>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text>  </Text>
                        </Grid>
                    </Grid>
                }
                {
                    tags.map((tag, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={tag.key}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={tag.value}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Button onClick={() => onRemoveTag(index)}>{t('industrial_models.common.remove')}</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddTag}>{t('industrial_models.common.add_tag')}</Button>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                { renderTrainingJobSetting() }
                { scriptMode && renderHyperparameters() }
                { renderInputDataConfiguration() }
                { !scriptMode && renderCheckpointConfiguration() }
                { !scriptMode && renderOutputDataConfiguration()}
                { !scriptMode && renderManagedSpotTraining() }
                { !scriptMode && renderTrainingJobTag() }
            </Stack>
        )
    }
    else {
        return (
            <Form
                header={t('industrial_models.training_job.create_training_job')}
                description={t('industrial_models.training_job.create_training_job_description')}
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
                    </div>
                }>            
                { renderTrainingJobSetting() }
                { scriptMode && renderHyperparameters() }
                { renderInputDataConfiguration() }
                { !scriptMode && renderCheckpointConfiguration() }
                { !scriptMode && renderOutputDataConfiguration()}
                { !scriptMode && renderManagedSpotTraining() }
                { !scriptMode && renderTrainingJobTag() }
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateTrainingjobInstanceTypeAction: UpdateTrainingjobInstanceType,
    updateTrainingjobInstanceCountAction: UpdateTrainingjobInstanceCount,
    updateTrainingjobVolumeSizeInGBAction: UpdateTrainingjobVolumeSizeInGB,
    updateTrainingjobHyperparametersAction: UpdateTrainingjobHyperparameters,
    updateTrainingjobInputDataAction: UpdateTrainingjobInputData,
    updateTrainingjobOutputS3UriAction: UpdateTrainingjobOutputS3Uri
};

const mapStateToProps = (state: AppState) => ({
    scriptMode: state.pipeline.scritpMode,
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobVolumeSizeInGB : state.pipeline.trainingjobVolumeSizeInGB,
    trainingjobHyperparameters: state.pipeline.trainingjobHyperparameters,
    trainingjobInputData : state.pipeline.trainingjobInputData,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    industrialModels : state.industrialmodel.industrialModels,
    industrialModel: state.pipeline.industrialModel
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TrainingJobForm);