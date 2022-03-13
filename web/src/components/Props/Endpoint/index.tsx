import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Flashbar, Stack } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { getUtcDate } from '../../Utils/Helper';

const EndpointProp: FunctionComponent = () => {
    const [ endpointName, setEndpointName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ lastModifiedTime, setLastModifiedTime ] = useState('')
    const [ endpointStatus, setEndpointStatus ] = useState('')
    const [ endpointConfig, setEndpointConfig ] = useState({})
    const [ productionVariants, setProductionVariants] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get('/endpoint/' + id, {params: {'case': params.name}})
            .then((response) => {
            setEndpointName(response.data.EndpointName)
            setCreationTime(getUtcDate(response.data.CreationTime))
            setLastModifiedTime(getUtcDate(response.data.LastModifiedTime))
            setEndpointStatus(response.data.EndpointStatus)
            setEndpointConfig(response.data.EndpointConfig)
            setProductionVariants(response.data.ProductionVariants)
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

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

    const renderFlashbar = () => {
        return (
            <Flashbar items={[{
                header: 'Loading endpoint information...',
                content: 'This may take up to an minute. Please wait a bit...',
                dismissible: true,
                loading: loading
            }]} />
        )
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
            { loading && renderFlashbar() }
            { !loading && renderEndpointSummary() }
            { !loading && renderEndpointRuntimeSettings() }
            { !loading && renderEndpointConfigurationSettings() }
        </Form>
    )
}

export default EndpointProp;