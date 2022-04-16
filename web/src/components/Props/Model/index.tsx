import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';

const ModelProp: FunctionComponent = () => {
    const [ modelName, setModelName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ primaryContainer, setPrimaryContainer ] = useState({})
    const [ containers, setContainers ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/model/${id}`)
            .then((response) => {
            if(response.data.length > 0) {
                setModelName(response.data[0].ModelName);
                setCreationTime(response.data[0].CreationTime);
                setPrimaryContainer(response.data[0].PrimaryContainer);
                setContainers(response.data[0].Containers);
                setLoading(false);
            }
        }, (error) => {
            console.log(error);
        });
    }, [id])

    const onClose = () => {
        history.goBack()
    }

    const renderModelSummary = () => {
        return (
            <FormSection header='Model summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Model name' value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Creation time' value={creationTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderContainerDefinition = () => {
        return (
            <FormSection header='Container definition'>
                {
                    primaryContainer !== undefined &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Mode' value={primaryContainer['Mode']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Container image' value={primaryContainer['Image']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Model data url' value={primaryContainer['ModelDataUrl']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    containers !== undefined && containers.length > 0 &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={6} sm={6} md={6}>
                            <KeyValuePair label='Model package arn' value={containers[0]['ModelPackageName']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    primaryContainer !== undefined && primaryContainer['Environment'] !== undefined && 
                    <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={12} sm={12} md={12}>
                            <Text> Environment variables </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> Key </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> Value </Text> 
                        </Grid>
                    </Grid>
                }
                {
                    primaryContainer !== undefined && primaryContainer['Environment'] !== undefined && 
                    Object.keys(primaryContainer['Environment']).map((key) => (
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={6} sm={6} md={6}>
                                <Text>{key}</Text>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6}>
                                <Text>{primaryContainer['Environment'][key]}</Text>
                            </Grid>
                        </Grid>
                    ))
                }
                {
                    containers !== undefined &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Mode' value={containers[0]['Mode']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Container image' value={containers[0]['ModelPackageName']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    containers !== undefined && containers[0]['Environment'] !== undefined && 
                    <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={12} sm={12} md={12}>
                            <Text> Environment variables </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> Key </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> Value </Text> 
                        </Grid>
                    </Grid>
                }
                {
                    containers !== undefined && containers[0]['Environment'] !== undefined && 
                    Object.keys(containers[0]['Environment']).map((key) => (
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={6} sm={6} md={6}>
                                <Text>{key}</Text>
                            </Grid>
                            <Grid item xs={6} sm={6} md={6}>
                                <Text>{containers[0]['Environment'][key]}</Text>
                            </Grid>
                        </Grid>
                    ))
                }
            </FormSection>
        )
    }

    return (
        <Form
            header='Review model'
            description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label='Loading...'/> }
            { !loading && renderModelSummary() }
            { !loading && renderContainerDefinition() }
        </Form>
    )
}

export default ModelProp;