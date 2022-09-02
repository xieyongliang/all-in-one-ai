import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, LoadingIndicator } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { useTranslation } from "react-i18next";

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

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        var component_name = 'com.example.yolov5'
        axios.get(`/greengrass/component/${component_name}/${id}`, {params: {'industrial_model': params.id}})
            .then((response) => {
            setComponentName(response.data.componentName);
            setComponentVersion(response.data.componentVersion);
            setCreationTimestamp(response.data.creationTimestamp)
            setPublisher(response.data.publisher);
            setDescription(response.data.description);
            setComponentState(response.data.status.componentState);
            setMessages(response.data.status.messages);
            setPlatforms(`os : ${response.data.platforms[0]['attributes'].os}`);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });
    }, [id, params.id])

    const onClose = () => {
        history.goBack()
    }

    const renderGreengrassComponentSummary = () => {
        return (
            <FormSection header={t('industrial_models.greengrass_component.greengrass_component_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.component_name')} value={componentName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.component_version')} value={componentVersion}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={creationTimestamp}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.publisher')} value={publisher}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.description')} value={description}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.platforms')} value={platforms}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderGreengrassComponentStatus = () => {
        return (
            <FormSection header={t('industrial_models.greengrass_component.greengrass_component_status')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.component_state')} value={componentState}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.message')} value={messages}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.greengrass_component.errors')} value={errors}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    return (
        <Form
            header={t('industrial_models.greengrass_component.create_greengrass_component')}
            description={t('industrial_models.greengrass_component.create_greengrass_component_description')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderGreengrassComponentSummary() }
            { !loading && renderGreengrassComponentStatus() }
        </Form>
    )
}

export default GreengrassComponentProp;