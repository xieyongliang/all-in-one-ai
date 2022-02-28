import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Link, Text, Flashbar, Input } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const TransformJobProp: FunctionComponent = () => {
    const [ transformJobName, setTransformJobName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ transformStartTime, setTransformStartTime ] = useState('')
    const [ transformEndTime, setTransformEndTime ] = useState('')
    const [ duration, setDuration ] = useState('')
    const [ status, setStatus ] = useState('')
    const [ s3DataType, setS3DataType ] = useState('')
    const [ instanceType, setInstanceType ] = useState('')
    const [ instanceCount, setInstanceCount ] = useState('')
    const [ contentType, setContentType ] = useState('')
    const [ maxConcurrentTransforms, setMaxConncurrentTransforms ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ inputS3Uri, setInputS3Uri ] = useState('')
    const [ outputS3Uri, setOutputS3Uri ] = useState('');
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/transformjob/${id}`, {params: {'case': params.name}})
            .then((response) => {
            setTransformJobName(response.data.transform_job_name)
            setCreationTime(response.data.creation_time)
            setTransformStartTime(response.data.transform_start_time)
            setTransformEndTime(response.data.transform_end_time)
            setStatus(response.data.transform_job_status)
            setS3DataType(response.data.s3_data_type)
            setInstanceType(response.data.instance_type)
            setInstanceCount(response.data.instance_count)
            setContentType(response.data.content_type)
            setMaxConncurrentTransforms(response.data.max_concurrent_transforms)
            setModelName(response.data.model_name)
            setDuration(response.data.duration)
            setInputS3Uri(response.data.input_s3uri)
            setOutputS3Uri(response.data.output_s3uri)
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
                    return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
            default:
                return null;
        }
    }

    const getLink = (link: string) => {
        return <Link href={link}> {link} </Link>
    }

    const onClose = () => {
        history.push(`/case/${params.name}?tab=demo#transformjob`)
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
            header="Review batch transform job"
            description="A transform job uses a model to transform data and stores the results at a specified location."
            actions={
                <div>
                    <Button variant="primary" onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading batch transform job information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
            <FormSection header='Job summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Job name" value={transformJobName}></KeyValuePair>
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
                        <KeyValuePair label="Transform start time" value={transformStartTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Transform end time" value={transformEndTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Job configuration">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Model name" value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Instance type" value={instanceType}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Instance count" value={instanceCount}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Max concurrent transforms" value={maxConcurrentTransforms}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header="Input data configuration">
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="S3 data type" value={s3DataType}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="S3 URI" value={getLink(inputS3Uri)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label="Content type" value={contentType}></KeyValuePair>
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

export default TransformJobProp;