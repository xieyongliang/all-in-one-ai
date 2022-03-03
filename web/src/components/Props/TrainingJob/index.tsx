import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Link, Flashbar, Text, Input } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const TrainingJobProp: FunctionComponent = () => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ trainingStartTime, setTrainingStartTime ] = useState('')
    const [ trainingEndTime, setTrainingEndTime ] = useState('')
    const [ duration, setDuration ] = useState('')
    const [ status, setStatus ] = useState('')
    const [ instanceType, setInstanceType ] = useState('')
    const [ instanceCount, setInstanceCount ] = useState('')
    const [ volumeSizeInGB, setVolumeSizeInGB ] = useState('')
    const [ imagesS3Uri, setImagesS3Uri ] = useState('')
    const [ labelsS3Uri, setLabelsS3Uri ] = useState('')
    const [ weightsS3Uri, setWeightsS3Uri ] = useState('')
    const [ cfgS3Uri, setCfgS3Uri ] = useState('')
    const [ outputS3Uri, setOutputS3Uri ] = useState('')
    const [ modelArtifacts, setModelArtifacts] = useState('')
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get('/trainingjob/' + id, {params: {'case': params.name}})
            .then((response) => {
            console.log(response)
            setTrainingJobName(response.data.training_job_name)
            setCreationTime(response.data.creation_time)
            setTrainingStartTime(response.data.training_start_time)
            setTrainingEndTime(response.data.training_end_time)
            setStatus(response.data.training_job_status)
            setInstanceType(response.data.instance_type)
            setInstanceCount(response.data.instance_count)
            setVolumeSizeInGB(response.data.instance_count)
            setDuration(response.data.duration)
            setImagesS3Uri(response.data.images_s3uri)
            setLabelsS3Uri(response.data.labels_s3uri)
            setWeightsS3Uri(response.data.weights_s3uri)
            setCfgS3Uri(response.data.cfg_s3uri)
            setOutputS3Uri(response.data.output_s3uri)
            if('S3ModelArtifacts' in response.data)
                setModelArtifacts(response.data.model_artifacts.S3ModelArtifacts)
            if('tags' in response.data)
                setTags(response.data.tags)
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
        return <Link href={link}> {link} </Link>
    }

    const onClose = () => {
        history.push(`/case/${params.name}?tab=trainingjob`)
    }

    const onAddTag = () => {
        tags.push({key:'', value:''});
        setForcedRefresh(!forcedRefresh);
    }

    const onRemoveTag = (index) => {
        tags.splice(index, 1);
        setForcedRefresh(!forcedRefresh);
    }

    return (
        <Form
            header="Review training job"
            description="When you create a training job, Amazon SageMaker sets up the distributed compute cluster, performs the training, and deletes the cluster when training has completed. The resulting model artifacts are stored in the location you specified when you created the training job."
            actions={
                <div>
                    <Button variant="primary" onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading training job information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
            <FormSection header='Job summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Job name" value={trainingJobName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Status" value={getStatus(status)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Approx. batch transform duration" value={duration}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Creation time" value={creationTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Transform start time" value={trainingStartTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Transform end time" value={trainingEndTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Model artifacts" value={modelArtifacts}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Resource configuration">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Instance type" value={instanceType}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Instance count" value={instanceCount}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Additional storage" value={volumeSizeInGB}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Input data configuration">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Images prefix" value={imagesS3Uri}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Labels prefix" value={labelsS3Uri}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Weights prefix" value={weightsS3Uri}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Cfg prefix" value={cfgS3Uri}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Output data configuration">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="S3 output path" value={getLink(outputS3Uri)}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Tags - optional">
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
                                <Input type="text" value={tag.key}/>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Input type="text" value={tag.value}/>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant="link" size="large" onClick={onAddTag}>Add tag</Button>
            </FormSection>
        </Form>
    )
}

export default TrainingJobProp;