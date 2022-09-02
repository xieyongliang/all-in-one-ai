import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Button, Form, FormSection, KeyValuePair } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { useTranslation } from "react-i18next";

const PipelineProp: FunctionComponent = () => {
    const [ pipelineType, setPipelineType ] = useState('')
    const [ trainingJobName, setTraingJobName ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ endpointName, setEndpointName ] = useState('')
    const [ ComponentVersionArn, setComponentVersionArn ] = useState('')
    const [ DeploymentId, setDeploymentId ] = useState('')
    const [ scriptMode, setScriptMode ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/pipeline`, {params: {'industrial_model': params.id, 'pipeline_execution_arn': id}})
            .then((response) => {
            if(response.data.length > 0) {
                setPipelineType(response.data[0].pipeline_type)
                setTraingJobName(response.data[0].training_job_name)
                setModelName(response.data[0].model_name)
                setEndpointName(response.data[0].endpoint_name)
                setComponentVersionArn(response.data[0].component_version_arn)
                setDeploymentId(response.data[0].deployment_id)
                if('script_mode' in response.data[0])
                    setScriptMode(response.data[0].script_mode)
            }
        }, (error) => {
            console.log(error);
        });
    }, [id, params.id])

    const onClose = () => {
        history.goBack()
    }

    const getTrainingJobProps = (id) => {
        return (
            <a href={`/imodels/${params.id}?tab=trainingjob#prop:id=${id}`}> {id} </a>
        )
    }

    const getModelProps = (id) => {
        return (
            <a href={`/imodels/${params.id}?tab=model#prop:id=${id}`}> {id} </a>
        )
    }

    const getEndpointProps = (id) => {
        return (
            <a href={`/imodels/${params.id}?tab=endpoint#prop:id=${id}`}> {id} </a>
        )
    }

    const getGreengrassComponentVersionProps = (id) => {
        return (
            <a href={`/imodels/${params.id}?tab=greengrasscomponentversion#prop:id=${id}`}> {id} </a>
        )
    }

    const getGreengrassDeploymentProps = (id) => {
        return (
            <a href={`/imodels/${params.id}?tab=greengrassdeployment#prop:id=${id}`}> {id} </a>
        )
    }

    return (
        <Form
            header={t('industrial_models.pipeline.review_pipeline')}
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                </div>
            }>
            <FormSection header={t('industrial_models.pipelines')}>
                <KeyValuePair label={t('industrial_models.pipeline.pipeline_name')} value={id}></KeyValuePair>            
            </FormSection>
            {
                ( pipelineType === '0' || pipelineType === '1') && 
                <FormSection header={t('industrial_models.training_jobs')}>
                    <KeyValuePair label={t('industrial_models.training_job.job_name')} value={getTrainingJobProps(trainingJobName)}></KeyValuePair>            
                </FormSection>
            }
            <FormSection header={t('industrial_models.models')}>
                <KeyValuePair label={t('industrial_models.model.model_name')} value={getModelProps(modelName)}></KeyValuePair>            
            </FormSection>
            <FormSection header={t('industrial_models.endpoints')}>
                <KeyValuePair label={t('industrial_models.endpoint.endpoint_name')} value={getEndpointProps(endpointName)}></KeyValuePair>            
            </FormSection>
            {
                ( pipelineType === '0' || pipelineType === '2') && !scriptMode &&
                <FormSection header={t('industrial_models.greengrass_components')}>
                    <KeyValuePair label={t('industrial_models.greengrass_component.component_version')} value={getGreengrassComponentVersionProps(ComponentVersionArn)}></KeyValuePair>            
                </FormSection>
            }
            {
                ( pipelineType === '0' || pipelineType === '2') && !scriptMode &&
                <FormSection header={t('industrial_models.greengrass_deployments')}>
                    <KeyValuePair label={t('industrial_models.greengrass_deployment.deployment_name')} value={getGreengrassDeploymentProps(DeploymentId)}></KeyValuePair>            
                </FormSection>
            }
        </Form>
    )
}

export default PipelineProp;