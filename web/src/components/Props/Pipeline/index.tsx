import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Button, Form, FormSection, KeyValuePair } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

const PipelineProp: FunctionComponent = () => {
    const [ pipelineType, setPipelineType ] = useState('')
    const [ trainingJobName, setTraingJobName ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ endpointName, setEndpointName ] = useState('')
    const [ ComponentVersionArn, setComponentVersionArn ] = useState('')
    const [ DeploymentId, setDeploymentId ] = useState('')

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/pipeline`, {params: {'industrial_model': params.id, 'pipeline_execution_arn': id}})
            .then((response) => {
            setPipelineType(response.data.pipeline_type)
            setTraingJobName(response.data.training_job_name)
            setModelName(response.data.model_name)
            setEndpointName(response.data.endpoint_name)
            setComponentVersionArn(response.data.component_version_arn)
            setDeploymentId(response.data.deployment_id)
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
            header='Review pipeline'
            actions={
                <div>
                    <Button variant='primary' onClick={onClose}>Close</Button>
                </div>
            }>
            <FormSection header='Pipeline'>
                <KeyValuePair label='Pipeline name' value={id}></KeyValuePair>            
            </FormSection>
            {
                ( pipelineType === '0' || pipelineType === '1') && 
                <FormSection header='Training job'>
                    <KeyValuePair label='Training job' value={getTrainingJobProps(trainingJobName)}></KeyValuePair>            
                </FormSection>
            }
            <FormSection header='Model'>
                <KeyValuePair label='Model' value={getModelProps(modelName)}></KeyValuePair>            
            </FormSection>
            <FormSection header='Endpoint'>
                <KeyValuePair label='Endpoint' value={getEndpointProps(endpointName)}></KeyValuePair>            
            </FormSection>
            {
                ( pipelineType === '0' || pipelineType === '2') && 
                <FormSection header='Greengrass component version'>
                    <KeyValuePair label='Greengrass component version' value={getGreengrassComponentVersionProps(ComponentVersionArn)}></KeyValuePair>            
                </FormSection>
            }
            {
                ( pipelineType === '0' || pipelineType === '2') && 
                <FormSection header='Greengrass deployment'>
                    <KeyValuePair label='Greengrass deployment' value={getGreengrassDeploymentProps(DeploymentId)}></KeyValuePair>            
                </FormSection>
            }
        </Form>
    )
}

export default PipelineProp;