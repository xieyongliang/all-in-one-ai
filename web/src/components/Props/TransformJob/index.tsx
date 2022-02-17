import KeyValuePair from 'aws-northstar/components/KeyValuePair';
import Container from 'aws-northstar/layouts/Container';
import StatusIndicator from 'aws-northstar/components/StatusIndicator';
import Stack from 'aws-northstar/layouts/Stack';
import { FunctionComponent, useEffect, useState } from 'react';
import { Link } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { PathParams } from '../../Utils/PathParams';
import axios from 'axios';

const Status = <StatusIndicator statusType="positive">Available</StatusIndicator>;

const TransformJobProp: FunctionComponent = () => {
    const [transformJobName, setTransformJobName] = useState('')
    const [creationTime, setCreationTime] = useState('')
    const [transformStartTime, setTransformStartTime] = useState('')
    const [transformEndTime, setTransformEndTime] = useState('')
    const [status, setStatus] = useState('')
    const [dataType, setDataType] = useState('')
    const [instanceType, setInstanceType] = useState('')
    const [instanceCount, setInstanceCount] = useState('')
    const [contentType, setContentType] = useState('')
    const [maxConcurrentTransform, setMaxConncurrentTransform] = useState('')
    const [modelName, setModelName] = useState('')
    const [duration, setDuration] = useState('')
    const [s3InputUri, setS3InputUri] = useState('')
    const [s3OutputUri, setS3OutputUri] = useState('');

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);
    console.log(id)

    useEffect(() => {
        axios.get('/transformjob/' + id, {params: {'case': params.name}})
            .then((response) => {
            setTransformJobName(response.data[0].transformjob_name)
            setCreationTime(response.data[0].creation_time)
            setTransformStartTime(response.data[0].transform_start_time)
            setTransformEndTime(response.data[0].transform_end_time)
            setStatus(response.data[0].status)
            setDataType(response.data[0].data_type)
            setInstanceType(response.data[0].instance_type)
            setInstanceCount(response.data[0].instance_count)
            setContentType(response.data[0].content_type)
            setMaxConncurrentTransform(response.data[0].max_concurrent_transform)
            setModelName(response.data[0].model_name)
            setDuration(response.data[0].duration)
            setS3InputUri(response.data[0].s3_input_uri)
            setS3OutputUri(response.data[0].s3_output_uri)
        }, (error) => {
            console.log(error);
        });
    }, [])

    function getStatus(status: string) {
        switch(status) {
            case 'Completed':
                return <StatusIndicator  statusType='positive'>Completed</StatusIndicator>;
            case 'Failed':
                return <StatusIndicator  statusType='negative'>Error</StatusIndicator>;
            case 'InProgress':
                return <StatusIndicator  statusType='info'>In progress</StatusIndicator>;
            case 'Stopped':
                    return <StatusIndicator  statusType='warning'>Error</StatusIndicator>;
            default:
                return null;
        }
    }

    function getLink(link: string) {
        return <Link href={link}> {link} </Link>
    }

    return (
            <Stack>
                <Container headingVariant='h4' title="Job summary">
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
                </Container>
                <Container headingVariant='h4' title="Job configuration">
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
                            <KeyValuePair label="Max concurrent transform" value={maxConcurrentTransform}></KeyValuePair>
                        </Grid>
                    </Grid>
                </Container>
                <Container headingVariant='h4' title="Input data configuration">
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label="S3 data type" value={dataType}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label="S3 URI" value={getLink(s3InputUri)}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label="Content type" value={contentType}></KeyValuePair>
                        </Grid>
                    </Grid>
                </Container>
                <Container headingVariant='h4' title="Output data configuration">
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label="S3 output path" value={getLink(s3OutputUri)}></KeyValuePair>
                        </Grid>
                    </Grid>
                </Container>
            </Stack>
    )
}

export default TransformJobProp;