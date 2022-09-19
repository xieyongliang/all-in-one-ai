import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getDurationByDates, logOutput } from '../../Utils/Helper';
import { useTranslation } from "react-i18next";

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

    const { t } = useTranslation();

    const history = useHistory();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/transformjob/${id}`)
            .then((response) => {
            if(response.data.length > 0) {
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
                setTags(response.data[0].tags)
                setLoading(false);
            }
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
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

    const onClose = () => {
        history.goBack()
    }

    const renderTransformJobSummary = () => {
        return (
            <FormSection header={t('industrial_models.transform_job.transform_ob_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.job_name')} value={transformJobName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.status')} value={getStatus(transformJobStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.duration')} value={getDurationByDates(transformStartTime, transformEndTime)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.transform_job.job_configuration')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.model_name')} value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.instance_type')} value={transformResources['InstanceType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.instance_count')} value={transformResources['InstanceCount']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.max_concurrent_transform')} value={maxConcurrentTransforms}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.max_payload_size_in_mb')} value={maxPayloadInMB}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.batch_strategy')} value={batchStrategy}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.max_invocation_retries')} value={modelClientConfig['InvocationsMaxRetries']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.invocation_timeout_in_seconds')} value={modelClientConfig['InvocationsTimeoutInSeconds']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderInputDataConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.transform_job.input_data_configuration')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.s3_data_type')} value={transformInput['DataSource']['S3DataSource']['S3DataType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.split_type')} value={transformInput['SplitType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.compression')} value={transformInput['CompressionType']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.content_type')} value={transformInput['ContentType']}></KeyValuePair>
                    </Grid>               
                    <Grid item xs={4} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.s3_location')} value={transformInput['DataSource']['S3DataSource']['S3Uri']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutputDataConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.transform_job.output_data_configuration')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.s3_output_path')} value={transformOutput['S3OutputPath']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.assemble_with')} value={transformOutput['AssembleWith']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.accept')} value={transformOutput['Accept']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderDataProcessingConfiguration = () => {
        return (
            <FormSection header={t('industrial_models.transform_job.filtering_and_data_joins')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.input_filter')} value={dataProcessing['InputFilter']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.join_source')} value={dataProcessing['OutputFilter']}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.transform_job.output_filter')} value={dataProcessing['JoinSource']}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobEnvironment = () => {
        return (
            <FormSection header={t('industrial_models.model.environments')}>
                {
                    environment !== undefined && Object.keys(environment).length > 0 &&
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
                    environment !== undefined && Object.keys(environment).map((key, index) => (
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
            header={t('industrial_models.transform_job.review_transform_job')}
            description={t('industrial_models.transform_job.create_transform_job_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
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