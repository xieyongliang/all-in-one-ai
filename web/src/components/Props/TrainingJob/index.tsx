import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Link, Flashbar } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
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
    const [ stoppingCondition, setStoppingCondition ] = useState({})
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();

    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/trainingjob/${id}`, {params: {'case': params.name}})
            .then((response) => {
            setTrainingJobName(response.data.TrainingJobName)
            setCreationTime(getUtcDate(response.data.CreationTime))
            setLastModifiedTime(getUtcDate(response.data.LastModifiedTime))
            setTrainingStartTime(getUtcDate(response.data.TrainingStartTime))
            setTrainingEndTime(getUtcDate(response.data.TrainingEndTime))
            setTrainingTimeInSeconds(response.data.TrainingTimeInSeconds)
            setBillableTimeInSeconds(response.data.BillableTimeInSeconds)
            setTrainingJobStatus(response.data.TrainingJobStatus)
            setAlgorithmSpecificaton(response.data.AlgorithmSpecification)
            setResourceConfig(response.data.ResourceConfig)
            setInputDataConfig(response.data.InputDataConfig)
            setOutputDataConfig(response.data.OutputDataConfig)
            setModelArtifacts(response.data.ModelArtifacts)
            setStoppingCondition(response.data.StoppingCondition)
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

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

    const getLink = (link: string) => {
        if(link !== undefined)
            return <Link href={link}> {link} </Link>
        else
            return ''
    }

    const onClose = () => {
        history.goBack()
    }

    const renderFlashbar = () => {
        return (
            <Flashbar items={[{
                header: 'Loading training job information...',
                content: 'This may take up to an minute. Please wait a bit...',
                dismissible: true,
                loading: loading
            }]} />
        )
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
                                    <KeyValuePair label='URI' value={getLink(channelConfig['DataSource']['S3DataSource']['S3Uri'])}></KeyValuePair>
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
                        <KeyValuePair label='S3 output path' value={getLink(outputDataConfig['S3OutputPath'])}></KeyValuePair>
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
                        <KeyValuePair label='S3 model artifact' value={getLink(modelArtifacts['S3ModelArtifacts'])}></KeyValuePair>
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
            { loading && renderFlashbar() }
            { !loading && renderJobSummary() }
            { !loading && renderAlgorithmSpecifications() }
            { !loading && renderInputDataConfiguration() }
            { !loading && renderOutputConfiguration() }
            { !loading && renderOutput() }
        </Form>
    )
}

export default TrainingJobProp;