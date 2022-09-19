import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Stack, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getLocaleDate, logOutput } from '../../Utils/Helper';
import { useTranslation } from "react-i18next";

const EndpointProp: FunctionComponent = () => {
    const [ endpointName, setEndpointName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ lastModifiedTime, setLastModifiedTime ] = useState('')
    const [ endpointStatus, setEndpointStatus ] = useState('')
    const [ endpointConfig, setEndpointConfig ] = useState({})
    const [ productionVariants, setProductionVariants] = useState([])
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get('/endpoint/' + id)
            .then((response) => {
            if(response.data.length > 0) {
                setEndpointName(response.data[0].EndpointName)
                setCreationTime(getLocaleDate(response.data[0].CreationTime))
                setLastModifiedTime(getLocaleDate(response.data[0].LastModifiedTime))
                setEndpointStatus(response.data[0].EndpointStatus)
                setEndpointConfig(response.data[0].EndpointConfig)
                setProductionVariants(response.data[0].ProductionVariants)
                setTags(response.data[0].Tags)
                setLoading(false);
            }
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }, [id])

    const getStatus = (status: string) => {
        switch(status) {
            case 'InService':
                return <StatusIndicator  statusType='positive'>{status}</StatusIndicator>;
            case 'OutOfService':
            case 'Failed':
            case 'RollingBack':
                return <StatusIndicator  statusType='negative'>{status}</StatusIndicator>;
            case 'Creating':
            case 'Updating':
            case 'SystemUpdating':
                return <StatusIndicator  statusType='info'>{status}</StatusIndicator>;
            case 'Deleting':
                return <StatusIndicator  statusType='warning'>{status}</StatusIndicator>;
            default:
                return null;
        }
    }

    const onClose = () => {
        history.goBack()
    }

    const renderEndpointSummary = () => {
        return (
            <FormSection header={t('industrial_models.endpoint.endpoint_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.endpoint.endpoint_name')} value={endpointName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.status')} value={getStatus(endpointStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.last_modified_time')} value={lastModifiedTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderEndpointRuntimeSettings = () => {
        return (
                <FormSection header={t('industrial_models.endpoint.endpoint_runtime_settings')}> 
                    {
                        productionVariants !== undefined && productionVariants.length > 0 && 
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label={t('industrial_models.endpoint.variant_name')} value={productionVariants[0]['VariantName']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label={t('industrial_models.endpoint.current_weight')} value={productionVariants[0]['CurrentWeight']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label={t('industrial_models.endpoint.desired_weight')} value={productionVariants[0]['DesiredWeight']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label={t('industrial_models.endpoint.current_instance_count')} value={productionVariants[0]['CurrentInstanceCount']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label={t('industrial_models.endpoint.desired_instance_count')} value={productionVariants[0]['DesiredInstanceCount']}></KeyValuePair>
                            </Grid>
                        </Grid>
                    }
                </FormSection>
        )
    }

    const renderEndpointTags = () => {
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

    const renderEndpointConfigurationSettings = () => {
        return (
            <FormSection header={t('industrial_models.endpoint.endpoint_configuration_settings')}>
                <Stack>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.endpoint.endpoint_configuration_name')} value={endpointConfig['EndpointConfigName']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.common.creation_time')} value={getLocaleDate(endpointConfig['CreationTime'])}></KeyValuePair>
                        </Grid>
                    </Grid>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.endpoint.model_name')} value={endpointConfig['ProductionVariants'][0]['ModelName']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.endpoint.instance_type')} value={endpointConfig['ProductionVariants'][0]['InstanceType']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.endpoint.initial_instance_count')} value={endpointConfig['ProductionVariants'][0]['InitialInstanceCount']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.endpoint.initial_weight')} value={endpointConfig['ProductionVariants'][0]['InitialVariantWeight']}></KeyValuePair>
                        </Grid>
                    </Grid>
                </Stack>
            </FormSection>
        )
    }
    return (
        <Form
            header={t('industrial_models.endpoint.review_endpoint')}
            description={t('industrial_models.endpoint.create_endpoint_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderEndpointSummary() }
            { !loading && renderEndpointRuntimeSettings() }
            { !loading && renderEndpointConfigurationSettings() }
            { !loading && renderEndpointTags() }
        </Form>
    )
}

export default EndpointProp;