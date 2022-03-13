import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Flashbar, Text, Input } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const RestApiProp: FunctionComponent = () => {
    const [ apilName, setApilName ] = useState('')
    const [ restApiName, setRestApiName ] = useState('')
    const [ apiPath, setApiPath ] = useState('')
    const [ apiStage, setApiStage ] = useState('')
    const [ apiMethod, setApiMethod ] = useState('')
    const [ apiFunction, setApiFunction ] = useState('')
    const [ createdDate, setCreatedDate ] = useState('')
    const [ apiUrl, setApiUrl ] = useState('')
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/api/${id}`, {params: {'case': params.name}})
            .then((response) => {
            console.log(response.data);
            setApilName(response.data.api_name);
            setRestApiName(response.data.rest_api_name);
            setApiPath(response.data.api_path);
            setApiStage(response.data.api_stage);
            setApiMethod(response.data.api_method);
            setApiFunction(response.data.api_function);
            setCreatedDate(response.data.created_date);
            setApiUrl(response.data.api_url);
            if('tags' in response.data)
                setTags(response.data.tags);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

    const onClose = () => {
        history.goBack()
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
            header='Review rest api'
            description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading api information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
            <FormSection header='Rest api summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Api name' value={apilName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Created date' value={createdDate}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Function' value={apiFunction}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Url' value={apiUrl}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header='Product variant'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Rest api name' value={restApiName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Path' value={apiPath}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Stage' value={apiStage}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Method' value={apiMethod}></KeyValuePair>
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

export default RestApiProp;