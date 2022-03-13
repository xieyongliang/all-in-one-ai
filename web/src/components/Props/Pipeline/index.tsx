import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Button, Form, FormSection, KeyValuePair } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';

const PipelineProp: FunctionComponent = () => {
    const [ trainingJobName, setTraingJobName ] = useState('')
    const [ modelName, setModelName ] = useState('')
    const [ endpointName, setEndpointName ] = useState('')
    const [ apiName, setApiName ] = useState('')
    const [ greengrassComponentVersionArn, setGreengrassComponentVersion ] = useState('')
    const [ greengrassDeploymentName, setGreengrassDeploymentName ] = useState('')

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var id = localtion.hash.substring(9);

    useEffect(() => {
        axios.get(`/pipeline`, {params: {'case': params.name, 'pipeline_execution_arn': id}})
            .then((response) => {
            console.log(response.data)
            if(response.data.training_job_name !== undefined)
                setTraingJobName(response.data.training_job_name)
            setModelName(response.data.model_name)
            setEndpointName(response.data.endpoint_name)
            setApiName(response.data.api_name)
        }, (error) => {
            console.log(error);
        });
    }, [id, params.name])

    const onClose = () => {
        history.goBack()
    }

    const getTrainingJobProps = (id) => {
        return (
            <a href={`/case/${params.name}?tab=trainingjob#prop:id=${id}`}> {id} </a>
        )
    }

    const getModelProps = (id) => {
        return (
            <a href={`/case/${params.name}?tab=model#prop:id=${id}`}> {id} </a>
        )
    }

    const getEndpointProps = (id) => {
        return (
            <a href={`/case/${params.name}?tab=endpoint#prop:id=${id}`}> {id} </a>
        )
    }

    const getApiProps = (id) => {
        return (
            <a href={`/case/${params.name}?tab=api#prop:id=${id}`}> {id} </a>
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
            <FormSection header='Training job'>
                <KeyValuePair label='Training job' value={getTrainingJobProps(trainingJobName)}></KeyValuePair>            
            </FormSection>
            <FormSection header='Model'>
                <KeyValuePair label='Model' value={getModelProps(modelName)}></KeyValuePair>            
            </FormSection>
            <FormSection header='Endpoint'>
                <KeyValuePair label='Endpoint' value={getEndpointProps(endpointName)}></KeyValuePair>            
            </FormSection>
            <FormSection header='Rest api'>
                <KeyValuePair label='Rest api' value={getApiProps(apiName)}></KeyValuePair>            
            </FormSection>
        </Form>
    )
}

export default PipelineProp;