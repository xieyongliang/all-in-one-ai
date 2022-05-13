import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, LoadingIndicator } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getUtcDate } from '../../Utils/Helper';

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
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var localtion = useLocation();

    var id = localtion.hash.substring(9);

    useEffect(() => {
        setLoading(true)
        axios.get(`/trainingjob/${id}`)
            .then((response) => {
            if(response.data.length > 0) {
                console.log(response.data[0])
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
            <FormSection header='Job summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Job name' value={trainingJobName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Status' value={getStatus(trainingJobStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Creation time' value={creationTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Training start time' value={trainingStartTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Training end time' value={trainingEndTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Last modified time' value={lastModifiedTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Training time (seconds)' value={trainingTimeInSeconds}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Billable time (seconds)' value={billableTimeInSeconds}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderAlgorithmSpecifications = () => {
        console.log(enableManagedSpotTraining)
        return (
            <FormSection header='Algorithm'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Instance type' value={resourceConfig['InstanceType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Instance count' value={resourceConfig['InstanceCount']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Additional storage' value={resourceConfig['VolumeSizeInGB']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Training image' value={algorithmSpecification['TrainingImage']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Input mode' value={algorithmSpecification['TrainingInputMode']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Maximum runtime (s)' value={stoppingCondition['MaxRuntimeInSeconds']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Maximum wait time for managed spot training(s)' value={'MaxWaitTimeInSeconds' in stoppingCondition ? stoppingCondition['MaxWaitTimeInSeconds'] : '-'}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Managed spot training' value={enableManagedSpotTraining ? 'Enabled' : 'Disabled'}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderHyperParameters = () => {
        return (    
            <FormSection header='HyperParameters'>
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
            <FormSection header='Input data configuration'>
                {
                    inputDataConfig.map((channelConfig) => {
                        return (
                            <Grid key={channelConfig['ChannelName']} container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label='Channel name' value={channelConfig['ChannelName']}></KeyValuePair>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label='S3 data type' value={channelConfig['DataSource']['S3DataSource']['S3DataType']}></KeyValuePair>
                                </Grid>                    
                                <Grid item xs={2} sm={4} md={4}>
                                    <KeyValuePair label='S3 data distribution type' value={channelConfig['DataSource']['S3DataSource']['S3DataDistributionType']}></KeyValuePair>
                                </Grid>                    
                                <Grid item xs={6} sm={6} md={6}>
                                    <KeyValuePair label='URI' value={channelConfig['DataSource']['S3DataSource']['S3Uri']}></KeyValuePair>
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
            <FormSection header='Output data configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={6} sm={6} md={6}>
                        <KeyValuePair label='S3 output path' value={outputDataConfig['S3OutputPath']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutput = () => {
        return (
            <FormSection header='Output'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={6} sm={6} md={6}>
                        { 
                            modelArtifacts !== undefined &&
                            <KeyValuePair label='S3 model artifact' value={modelArtifacts['S3ModelArtifacts']}></KeyValuePair> 
                        }
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    return (
        <Form
            header='Review training job'
            description='When you create a training job, Amazon SageMaker sets up the distributed compute cluster, performs the training, and deletes the cluster when training has completed. The resulting model artifacts are stored in the location you specified when you created the training job.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label='Loading...'/> }
            { !loading && renderJobSummary() }
            { !loading && renderAlgorithmSpecifications() }
            { !loading && renderHyperParameters() }
            { !loading && renderInputDataConfiguration() }
            { !loading && renderOutputConfiguration() }
            { !loading && renderOutput() }
        </Form>
    )
}

export default TrainingJobProp;