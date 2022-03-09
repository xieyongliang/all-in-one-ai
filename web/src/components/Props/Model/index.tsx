import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Flashbar, Text, Input } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const ModelProp: FunctionComponent = () => {
    const [ modelName, setModelName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ containerIamge, setContainerImage ] = useState('')
    const [ modelDataUrl, setModelDataUrl ] = useState('')
    const [ mode, setMode ] = useState('')
    const [ modelPackageArn, setModelPackageArn ] = useState('')
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/model/${id}`, {params: {'case': params.name}})
            .then((response) => {
            console.log(response.data);
            setModelName(response.data.model_name);
            setCreationTime(response.data.creation_time);
            if('model_package_arn' in response.data) {
                setModelPackageArn(response.data.model_package_arn)
            }
            else {
                setContainerImage(response.data.container_image);
                setModelDataUrl(response.data.model_data_url);
                setMode(response.data.mode);    
            }
            if('tags' in response.data)
                setTags(response.data.tags);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

    const onClose = () => {
        history.push(`/case/${params.name}?tab=model`)
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
            header='Review model'
            description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading model information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
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
            <FormSection header='Container definition'>
                {
                    modelPackageArn === '' &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Mode' value={mode}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Container image' value={containerIamge}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label='Model data url' value={modelDataUrl}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    modelPackageArn !== '' &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={6} sm={6} md={6}>
                            <KeyValuePair label='Model package arn' value={modelPackageArn}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
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

export default ModelProp;