import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { KeyValuePair, Button, Form, FormSection, LoadingIndicator } from 'aws-northstar';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { PathParams } from '../../Interfaces/PathParams';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

const RestApiProp: FunctionComponent = () => {
    const [ apilName, setApilName ] = useState('')
    const [ restApiName, setRestApiName ] = useState('')
    const [ apiPath, setApiPath ] = useState('')
    const [ apiStage, setApiStage ] = useState('')
    const [ apiMethod, setApiMethod ] = useState('')
    const [ apiFunction, setApiFunction ] = useState('')
    const [ createdDate, setCreatedDate ] = useState('')
    const [ apiUrl, setApiUrl ] = useState('')
    const [ loading, setLoading ] = useState(true);

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/api/${id}`, {params: {'industrial_model': params.id}})
            .then((response) => {
            setApilName(response.data[0].api_name);
            setRestApiName(response.data[0].rest_api_name);
            setApiPath(response.data[0].api_path);
            setApiStage(response.data[0].api_stage);
            setApiMethod(response.data[0].api_method);
            setApiFunction(response.data[0].api_function);
            setCreatedDate(response.data[0].created_date);
            setApiUrl(response.data[0].api_url);
            setLoading(false);
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }, [id, params.id])

    const onClose = () => {
        history.goBack()
    }

    const renderApiSummary = () => {
        return (
            <FormSection header={t('industrial_models.api.api_summary')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.api.api_name')} value={apilName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.creation_time')} value={createdDate}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.common.function')} value={apiFunction}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={12} md={12}>
                        <KeyValuePair label={t('industrial_models.common.uri')} value={apiUrl}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderProductionVariants = () => {
        return (
            <FormSection header={t('industrial_models.api.production_variant')}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.api.rest_api_name')} value={restApiName}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.api.api_path')} value={apiPath}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.api.api_stage')} value={apiStage}></KeyValuePair>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <KeyValuePair label={t('industrial_models.api.api_method')} value={apiMethod}></KeyValuePair>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    return (
        <Form
            header={t('industrial_models.api.review_api')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderApiSummary() }
            { !loading && renderProductionVariants() }
        </Form>
    )
}

export default RestApiProp;