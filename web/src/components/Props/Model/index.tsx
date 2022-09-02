import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, LoadingIndicator, Text } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { useTranslation } from "react-i18next";

const ModelProp: FunctionComponent = () => {
    const [ modelName, setModelName ] = useState('')
    const [ creationTime, setCreationTime ] = useState('')
    const [ primaryContainer, setPrimaryContainer ] = useState({})
    const [ containers, setContainers ] = useState([])
    const [ tags, setTags ] = useState([])
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

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
                setTags(response.data[0].Tags);
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
            <FormSection header={t('industrial_models.model.model_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.model.model_name')} value={modelName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTime}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderContainerDefinition = () => {
        return (
            <FormSection header={t('industrial_models.model.container_definition')}>
                {
                    primaryContainer !== undefined &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.model.mode')} value={primaryContainer['Mode']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.model.container_image')} value={primaryContainer['Image']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.model.model_data_url')} value={primaryContainer['ModelDataUrl']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    containers !== undefined && containers.length > 0 &&
                    <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={6} sm={6} md={6}>
                            <KeyValuePair label={t('industrial_models.model.model_package_arn')} value={containers[0]['ModelPackageName']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    primaryContainer !== undefined && primaryContainer['Environment'] !== undefined && 
                    <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={12} sm={12} md={12}>
                            <Text> {t('industrial_models.model.environments')} </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> {t('industrial_models.common.key')} </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> {t('industrial_models.common.value')} </Text> 
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
                            <KeyValuePair label={t('industrial_models.model.mode')} value={containers[0]['Mode']}></KeyValuePair>
                        </Grid>
                        <Grid item xs={2} sm={4} md={4}>
                            <KeyValuePair label={t('industrial_models.model.container_image')} value={containers[0]['ModelPackageName']}></KeyValuePair>
                        </Grid>
                    </Grid>
                }
                {
                    containers !== undefined && containers[0]['Environment'] !== undefined && 
                    <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                        <Grid item xs={12} sm={12} md={12}>
                            <Text> {t('industrial_models.model.environments')} </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> {t('industrial_models.common.key')} </Text>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6}>
                            <Text> {t('industrial_models.common.value')} </Text> 
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

    const renderModelTags = () => {
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
            header={t('industrial_models.model.review_model')}
            description={t('industrial_models.model.create_model_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderModelSummary() }
            { !loading && renderContainerDefinition() }
            { !loading && renderModelTags() }
        </Form>
    )
}

export default ModelProp;