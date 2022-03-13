import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, Flashbar } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';

const ModelProp: FunctionComponent = () => {
    const [ modelName, setModelName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ primaryContainer, setPrimaryContainer ] = useState({})
    const [ containers, setContainers ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/model/${id}`, {params: {'case': params.name}})
            .then((response) => {
            console.log(response.data);
            setModelName(response.data.ModelName);
            setCreationTime(response.data.CreationTime);
            setPrimaryContainer(response.data.PrimaryContainer);
            setContainers(response.data.Containers);
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
            </FormSection>
        </Form>
    )
}

export default ModelProp;