import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Link, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getDurationByDates } from '../../Utils/Helper';

const TransformJobProp: FunctionComponent = () => {
    const [ transformJobName, setTransformJobName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ transformStartTime, setTransformStartTime ] = useState('')
    const [ transformEndTime, setTransformEndTime ] = useState('')
    const [ transformJobStatus, setTransformJobStatus ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ maxConcurrentTransforms, setMaxConncurrentTransforms ] = useState('')
    const [ maxPayloadInMB, setMaxPayloadInMB ] = useState('')
    const [ batchStrategy, setBatchStrategy ] = useState('')
    const [ modelClientConfig, setModelClientConfig ] = useState([])
    const [ transformInput, setTransformInput ] = useState({})
    const [ transformOutput, setTransformOutput ] = useState({})
    const [ transformResources, setTransformResources ] = useState({})
    const [ dataProcessing, setDataProcessing ] = useState({})
    const [ environment, setEnvironment ] = useState({})
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/transformjob/${id}`)
            .then((response) => {
            if(response.data.length > 0) {
                console.log(response.data[0])
                setTransformJobName(response.data[0].TransformJobName);
                setCreationTime(response.data[0].CreationTime);
                setTransformStartTime(response.data[0].TransformStartTime);
                setTransformEndTime(response.data[0].TransformEndTime);
                setTransformJobStatus(response.data[0].TransformJobStatus);
                setModelName(response.data[0].ModelName);
                setMaxConncurrentTransforms(response.data[0].MaxConcurrentTransforms);
                setMaxPayloadInMB(response.data[0].MaxPayloadInMB);
                setBatchStrategy(response.data[0].BatchStrategy);
                setModelClientConfig(response.data[0].ModelClientConfig);
                setTransformInput(response.data[0].TransformInput);
                setTransformOutput(response.data[0].TransformOutput);
                setDataProcessing(response.data[0].DataProcessing)
                setTransformResources(response.data[0].TransformResources);
                setEnvironment(response.data[0].Environment);
                if('tags' in response.data[0])
                    setTags(response.data[0].tags)
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
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Max payload size (MB)' value={maxPayloadInMB}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Batch strategy' value={batchStrategy}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Max invocation retries' value={modelClientConfig['InvocationsMaxRetries']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Invocation timeout in seconds' value={modelClientConfig['InvocationsTimeoutInSeconds']}></KeyValuePair>
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
                        <KeyValuePair label='Accept' value={transformOutput['Accept']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Assemble with' value={transformOutput['AssembleWith']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderDataProcessingConfiguration = () => {
        return (
            <FormSection header='Data processing configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Input data filter' value={dataProcessing['InputFilter']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Output data filter' value={dataProcessing['OutputFilter']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Join source to output' value={dataProcessing['JoinSource']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobEnvironment = () => {
        return (
            <FormSection header='Environment'>
                {
                    Object.keys(environment).length > 0 &&
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> Key </Text>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> Value </Text> 
                        </Grid>
                    </Grid>
                }
                {
                    Object.keys(environment).map((key, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text>{key}</Text>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text>{environment[key]}</Text>
                            </Grid>
                        </Grid>
                    ))
                }
            </FormSection>
        )
    }

    const renderTransformJobTags = () => {
        return (
            <FormSection header='Tags'>
                {
                    tags.length > 0 && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> Key </Text>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text> Value </Text> 
                        </Grid>
                    </Grid>
                }
                {
                    tags.map((tag, index) => (
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
            header='Review batch transform job'
            description='A transform job uses a model to transform data and stores the results at a specified location.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label='Loading...'/> }
            { !loading && renderTransformJobSummary() }
            { !loading && renderTransformJobConfiguration() }
            { !loading && renderInputDataConfiguration() }
            { !loading && renderOutputDataConfiguration() }
            { !loading && renderDataProcessingConfiguration() }
            { !loading && renderTransformJobEnvironment() }
            { !loading && renderTransformJobTags() }
        </Form>
    )
}

export default TransformJobProp;