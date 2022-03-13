import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Flashbar } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const GreengrassComponentProp: FunctionComponent = () => {
    const [ componentName, setComponentName ] = useState('')
    const [ componentVersion, setComponentVersion ] = useState('')
    const [ creationTimestamp, setCreationTimestamp ] = useState('')
    const [ publisher, setPublisher ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ platforms, setPlatforms ] = useState('')
    const [ componentState, setComponentState ] = useState('')
    const [ messages, setMessages ] = useState('')
    const [ errors ] = useState('')
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        var component_name = 'com.example.yolov5'
        axios.get(`/greengrass/component/${component_name}/${id}`, {params: {'case': params.name}})
            .then((response) => {
            console.log(response.data);
            setComponentName(response.data.componentName);
            setComponentVersion(response.data.componentVersion);
            setCreationTimestamp(response.data.creationTimestamp)
            setPublisher(response.data.publisher);
            setDescription(response.data.description);
            setComponentState(response.data.status.componentState);
            setMessages(response.data.status.messages);
            console.log(typeof(response.data.status.errors));
            setPlatforms(`os : ${response.data.platforms[0]['attributes'].os}`);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

    const onClose = () => {
        history.goBack()
    }

    return (
        <Form
            header='Review Greengrass component'
            description='When you finish your component, you can add it to AWS IoT Greengrass to deploy to core devices. Provide the component recipe and artifacts to create the component. This component is private and visible only to your AWS account.'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>   
            {   
                loading && <Flashbar items={[{
                    header: 'Loading Greengrass component information...',
                    content: 'This may take up to an minute. Please wait a bit...',
                    dismissible: true,
                    loading: loading
                }]} />
            }
            <FormSection header='Greengrass component version summary'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Component name' value={componentName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Component version' value={componentVersion}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Creation time' value={creationTimestamp}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Publisher' value={publisher}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Description' value={description}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Platforms' value={platforms}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
            <FormSection header='Greengrass component status'>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Component state' value={componentState}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Message' value={messages}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label='Errors' value={errors}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        </Form>
    )
}

export default GreengrassComponentProp;