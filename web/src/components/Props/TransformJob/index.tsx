import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Link, Flashbar } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { getDurationByDates } from '../../Utils/Helper';

const TransformJobProp: FunctionComponent = () => {
    const [ transformJobName, setTransformJobName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ transformStartTime, setTransformStartTime ] = useState('')
    const [ transformEndTime, setTransformEndTime ] = useState('')
    const [ transformJobStatus, setTransformJobStatus ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ maxConcurrentTransforms, setMaxConncurrentTransforms ] = useState('')
    const [ transformInput, setTransformInput ] = useState({})
    const [ transformOutput, setTransformOutput ] = useState({})
    const [ transformResources, setTransformResources ] = useState({})
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/transformjob/${id}`, {params: {'case': params.name}})
            .then((response) => {
            setTransformJobName(response.data.TransformJobName);
            setCreationTime(response.data.CreationTime);
            setTransformStartTime(response.data.TransformStartTime);
            setTransformEndTime(response.data.TransformEndTime);
            setTransformJobStatus(response.data.TransformJobStatus);
            setModelName(response.data.ModelName);
            setMaxConncurrentTransforms(response.data.MaxConcurrentTransforms);
            setTransformInput(response.data.TransformInput);
            setTransformOutput(response.data.TransformOutput);
            setTransformResources(response.data.TransformResources);
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
        if(link !== undefined)
            return <Link href={link}> {link} </Link>
        else
            return ''
    }

    const onClose = () => {
        history.push(`/case/${params.name}?tab=demo#transformjob`)
    }

    const renderFlashbar = () => {
        return (
            <Flashbar items={[{
                header: 'Loading batch transform job information...',
                content: 'This may take up to an minute. Please wait a bit...',
                dismissible: true,
                loading: loading
            }]} />
        )
    }

    const renderTransformJobSummary = () => {
        return (
            <FormSection header='Job summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Job name' value={transformJobName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Status' value={getStatus(transformJobStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Approx. batch transform duration' value={getDurationByDates(transformStartTime, transformEndTime)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Creation time' value={creationTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobConfiguration = () => {
        return (
            <FormSection header='Job configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Model name' value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Instance type' value={transformResources['InstanceType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Instance count' value={transformResources['InstanceCount']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Max concurrent transforms' value={maxConcurrentTransforms}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderInputDataConfiguration = () => {
        return (
            <FormSection header='Input data configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='S3 data type' value={transformInput['DataSource']['S3DataSource']['S3DataType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Split type' value={transformInput['SplitType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Compression type' value={transformInput['CompressionType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={4} sm={4} md={4}>
                        <KeyValuePair label='S3 URI' value={getLink(transformInput['DataSource']['S3DataSource']['S3Uri'])}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Content type' value={transformInput['ContentType']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutputDataConfiguration = () => {
        return (
            <FormSection header='Output data configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='S3 output path' value={getLink(transformOutput['S3OutputPath'])}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Assemble with' value={transformOutput['AssembleWith']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }
    return (
        <Form
            header='Review batch transform job'
            description='A transform job uses a model to transform data and stores the results at a specified location.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && renderFlashbar() }
            { !loading && renderTransformJobSummary() }
            { !loading && renderTransformJobConfiguration() }
            { !loading && renderInputDataConfiguration() }
            { !loading && renderOutputDataConfiguration() }
        </Form>
    )
}

export default TransformJobProp;