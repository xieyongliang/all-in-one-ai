import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, StatusIndicator, Button, Form, FormSection, Flashbar, Text, Input } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const EndpointProp: FunctionComponent = () => {
    const [ endpointName, setEndpointName ] = useState('')
    const [ endpointConfigName, setEndpointConfigName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ lastModifiedTime, setLastModifiedTime ] = useState('')
    const [ endpointStatus, setEndpointStatus ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ instanceType, setInstanceType ] = useState('')
    const [ acceleratorType, setAcceleratorType ] = useState('')
    const [ initialInstanceCount, setInitialInstanceCount ] = useState('')
    const [ initialVariantWeight, setInitialVariantWeight ] = useState('')
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get('/endpoint/' + id, {params: {'case': params.name}})
            .then((response) => {
            console.log(response)
            setEndpointName(response.data.endpoint_name)
            setEndpointConfigName(response.data.endpoint_config_name)
            setCreationTime(response.data.creation_time)
            setLastModifiedTime(response.data.last_modified_time)
            setEndpointStatus(response.data.endpoint_status)
            setModelName(response.data.model_name)
            setInstanceType(response.data.instance_type)
            setAcceleratorType(response.data.accelerator_type)
            setInitialInstanceCount(response.data.initial_instance_count)
            setInitialVariantWeight(response.data.initial_variant_weight)
            if('tags' in response.data)
                setTags(response.data.tags)
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
        history.push(`/case/${params.name}?tab=endpoint`)
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
            header='Review endpoint'
            description='To deploy models to Amazon SageMaker, first create an endpoint. Specify which models to deploy, and the relative traffic weighting and hardware requirements for each. '
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading endpoint information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
            <FormSection header='Endpoint summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Endpoint name' value={endpointName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Endpoint config name' value={endpointConfigName}></KeyValuePair>
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
            <FormSection header='Endpoint configuration'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Model name' value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Instance type' value={instanceType}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Accelerator type' value={acceleratorType}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Initial instance count' value={initialInstanceCount}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Initial variant weight' value={initialVariantWeight}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header='Tags - optional'>
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
                                <Input type='text' value={tag.key}/>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Input type='text' value={tag.value}/>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddTag}>Add tag</Button>
            </FormSection>
        </Form>
    )
}

export default EndpointProp;