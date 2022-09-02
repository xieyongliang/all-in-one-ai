import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getUtcDate } from '../../Utils/Helper';
import { useTranslation } from "react-i18next";

const TrainingJobProp: FunctionComponent = () => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ lastModifiedTime, setLastModifiedTime ] = useState('')
    const [ trainingTimeInSeconds, setTrainingTimeInSeconds ] = useState('')
    const [ billableTimeInSeconds, setBillableTimeInSeconds ] = useState('')
    const [ trainingStartTime, setTrainingStartTime ] = useState('')
    const [ trainingEndTime, setTrainingEndTime ] = useState('')
    const [ trainingJobStatus, setTrainingJobStatus ] = useState('')
    const [ algorithmSpecification, setAlgorithmSpecificaton ] = useState({})
    const [ resourceConfig, setResourceConfig ] = useState({})
    const [ inputDataConfig, setInputDataConfig ] = useState([])
    const [ outputDataConfig, setOutputDataConfig ] = useState({})
    const [ modelArtifacts, setModelArtifacts ] = useState({})
    const [ hyperParameters, setHyperParameters ] = useState({})
    const [ stoppingCondition, setStoppingCondition ] = useState({})
    const [ enableManagedSpotTraining, setEnableManagedSpotTraining ] = useState('')
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var localtion = useLocation();

    var id = localtion.hash.substring(9);

    useEffect(() => {
        setLoading(true)
        axios.get(`/trainingjob/${id}`)
            .then((response) => {
            if(response.data.length > 0) {
                setTrainingJobName(response.data[0].TrainingJobName)
                setCreationTime(getUtcDate(response.data[0].CreationTime))
                setLastModifiedTime(getUtcDate(response.data[0].LastModifiedTime))
                setTrainingStartTime(('TrainingStartTime' in response.data[0] ? getUtcDate(response.data[0].TrainingStartTime) : '-'))
                setTrainingEndTime(('TrainingEndTime' in response.data[0] ? getUtcDate(response.data[0].TrainingEndTime) : '-'))
                setTrainingTimeInSeconds(response.data[0].TrainingTimeInSeconds)
                setBillableTimeInSeconds(response.data[0].BillableTimeInSeconds)
                setTrainingJobStatus(response.data[0].TrainingJobStatus)
                setAlgorithmSpecificaton(response.data[0].AlgorithmSpecification)
                setHyperParameters(response.data[0].HyperParameters)
                setResourceConfig(response.data[0].ResourceConfig)
                setInputDataConfig(response.data[0].InputDataConfig)
                setOutputDataConfig(response.data[0].OutputDataConfig)
                setModelArtifacts(response.data[0].ModelArtifacts)
                setStoppingCondition(response.data[0].StoppingCondition)
                setEnableManagedSpotTraining(response.data[0].EnableManagedSpotTraining)
                setTags(response.data[0].Tags)
                setLoading(false);
            }
        }, (error) => {
            console.log(error);
        });
    }, [id])

    const getStatus = (status: string) => {
        switch(status) {
            case 'Completed':
                return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
            case 'Failed':
                return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
            case 'InProgress':
                return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
            case 'Stopped':
            case 'Stopping':
                return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
            default:
                return null;
        }
    }

    const onClose = () => {
        history.goBack()
    }

    const renderJobSummary = () => {
        return (
            <FormSection header={t('industrial_models.training_job.job_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.job_name')} value={trainingJobName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.status')} value={getStatus(trainingJobStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.training_start_time')} value={trainingStartTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.training_end_time')} value={trainingEndTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.last_modified_time')} value={lastModifiedTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.training_time_in_seconds')} value={trainingTimeInSeconds}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.billable_time_in_seconds')} value={billableTimeInSeconds}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderAlgorithmSpecifications = () => {
        return (
            <FormSection header={t('app_layout.algorithms')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.instance_type')} value={resourceConfig['InstanceType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.instance_count')} value={resourceConfig['InstanceCount']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.additional_storage_volume_in_gb')} value={resourceConfig['VolumeSizeInGB']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.training_image')} value={algorithmSpecification['TrainingImage']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.training_input_mode')}  value={algorithmSpecification['TrainingInputMode']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.maximum_runtime_in_seconds')}  value={stoppingCondition['MaxRuntimeInSeconds']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.maximum_wait_time_in_seconds')} value={'MaxWaitTimeInSeconds' in stoppingCondition ? stoppingCondition['MaxWaitTimeInSeconds'] : '-'}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.training_job.managed_spot_training')} value={enableManagedSpotTraining ? 'Enabled' : 'Disabled'}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderHyperParameters = () => {
        return (    
            <FormSection header={t('industrial_models.training_job.hyperparameters')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {
                        Object.keys(hyperParameters).map((key) => {
                            return (
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label={key} value={hyperParameters[key]}></KeyValuePair>                        
                                </Grid>
                            )
                        })
                    }
                </Grid>
            </FormSection>
        )
    }

    const renderInputDataConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.training_job.input_data_configuration')}>
                {
                    inputDataConfig.map((channelConfig) => {
                        return (
                            <Grid key={channelConfig['ChannelName']} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label={t('industrial_models.training_job.channel_name')} value={channelConfig['ChannelName']}></KeyValuePair>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label={t('industrial_models.training_job.s3_data_type')} value={channelConfig['DataSource']['S3DataSource']['S3DataType']}></KeyValuePair>
                                </Grid>                    
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label={t('industrial_models.training_job.s3_data_distribution_type')} value={channelConfig['DataSource']['S3DataSource']['S3DataDistributionType']}></KeyValuePair>
                                </Grid>                    
                                <Grid item xs={6} sm={6} md={6}>
                                    <KeyValuePair label={t('industrial_models.common.uri')} value={channelConfig['DataSource']['S3DataSource']['S3Uri']}></KeyValuePair>
                                </Grid>                    
                            </Grid>
                        )
                    })
                }
            </FormSection>
        )
    }

    const renderOutputConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.training_job.output_data_configuration')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={6} sm={6} md={6}>
                        <KeyValuePair label={t('industrial_models.training_job.s3_output_path')} value={outputDataConfig['S3OutputPath']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutput = () => {
        return (
            <FormSection header={t('industrial_models.demo.output')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={6} sm={6} md={6}>
                        { 
                            modelArtifacts !== undefined &&
                            <KeyValuePair label={t('industrial_models.training_job.s3_model_artifact')} value={modelArtifacts['S3ModelArtifacts']}></KeyValuePair> 
                        }
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTrainingJobTags = () => {
        return (
            <FormSection header={t('industrial_models.common.tags')}>
                {
                    tags !== undefined && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> {t('industrial_models.common.key')} </Text>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> {t('industrial_models.common.value')} </Text> 
                        </Grid>
                    </Grid>
                }
                {
                    tags !== undefined && tags.map((tag, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text>{tag.key}</Text>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text>{tag.value}</Text>
                            </Grid>
                        </Grid>
                    ))
                }
            </FormSection>
        )
    }

    return (
        <Form
            header={t('industrial_models.training_job.review_training_job')}
            description={t('industrial_models.training_job.create_training_job_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderJobSummary() }
            { !loading && renderAlgorithmSpecifications() }
            { !loading && renderHyperParameters() }
            { !loading && renderInputDataConfiguration() }
            { !loading && renderOutputConfiguration() }
            { !loading && renderOutput() }
            { !loading && renderTrainingJobTags() }
        </Form>
    )
}

export default TrainingJobProp;