import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Stack, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { getUtcDate } from '../../Utils/Helper';

const EndpointProp: FunctionComponent = () => {
    const [ endpointName, setEndpointName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ lastModifiedTime, setLastModifiedTime ] = useState('')
    const [ endpointStatus, setEndpointStatus ] = useState('')
    const [ endpointConfig, setEndpointConfig ] = useState({})
    const [ productionVariants, setProductionVariants] = useState([])
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get('/endpoint/' + id)
            .then((response) => {
            if(response.data.length > 0) {
                setEndpointName(response.data[0].EndpointName)
                setCreationTime(getUtcDate(response.data[0].CreationTime))
                setLastModifiedTime(getUtcDate(response.data[0].LastModifiedTime))
                setEndpointStatus(response.data[0].EndpointStatus)
                setEndpointConfig(response.data[0].EndpointConfig)
                setProductionVariants(response.data[0].ProductionVariants)
                setTags(response.data[0].Tags)
                setLoading(false);
            }
        }, (error) => {
            console.log(error);
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
            <FormSection header='Endpoint summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Endpoint name' value={endpointName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Status' value={getStatus(endpointStatus)}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Creation time' value={creationTime}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Last modified time' value={lastModifiedTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderEndpointRuntimeSettings = () => {
        return (
                <FormSection header='Endpoint runtime settings'> 
                    {
                        productionVariants !== undefined && productionVariants.length > 0 && 
                        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label='Variant name' value={productionVariants[0]['VariantName']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label='Current weight' value={productionVariants[0]['CurrentWeight']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label='Desired weight' value={productionVariants[0]['DesiredWeight']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label='Current instance count' value={productionVariants[0]['CurrentInstanceCount']}></KeyValuePair>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <KeyValuePair label='Desired instance count' value={productionVariants[0]['DesiredInstanceCount']}></KeyValuePair>
                            </Grid>
                        </Grid>
                    }
                </FormSection>
        )
    }

    const renderEndpointTags = () => {
        return (
            <FormSection header='Tags'>
                {
                    tags !== undefined && 
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
            <FormSection header='Endpoint configuration settings'>
                <Stack>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Endpoint config name' value={endpointConfig['EndpointConfigName']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Creation time' value={getUtcDate(endpointConfig['CreationTime'])}></KeyValuePair>
                        </Grid>
                    </Grid>
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Model name' value={endpointConfig['ProductionVariants'][0]['ModelName']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Instance type' value={endpointConfig['ProductionVariants'][0]['InstanceType']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Initial instance count' value={endpointConfig['ProductionVariants'][0]['InitialInstanceCount']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Initial variant weight' value={endpointConfig['ProductionVariants'][0]['InitialVariantWeight']}></KeyValuePair>
                        </Grid>
                    </Grid>
                </Stack>
            </FormSection>
        )
    }
    return (
        <Form
            header='Review endpoint'
            description='To deploy models to Amazon SageMaker, first create an endpoint. Specify which models to deploy, and the relative traffic weighting and hardware requirements for each. '
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label='Loading...'/> }
            { !loading && renderEndpointSummary() }
            { !loading && renderEndpointRuntimeSettings() }
            { !loading && renderEndpointConfigurationSettings() }
            { !loading && renderEndpointTags() }
        </Form>
    )
}

export default EndpointProp;