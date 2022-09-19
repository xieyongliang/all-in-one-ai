import { FunctionComponent, useState } from 'react';
import { BrowserRouter, useHistory, useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Wizard, FormField, Input, LoadingIndicator } from 'aws-northstar/components';
import { Container, Stack } from 'aws-northstar/layouts';
import axios from 'axios';
import TrainingJobForm from '../TrainingJob';
import ModelForm from '../Model';
import EndpointForm from '../Endpoint';
import GreengrassComponentForm from '../GreengrassComponent';
import GreengrassDeploymentForm from '../GreengrassDeployment';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import { AppState } from '../../../store';
import { PathParams } from '../../Interfaces/PathParams';
import { UpdateIndustrialModel, UpdateModelAlgorithm, UpdatePipelineType, UpdateScriptMode } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { Box, Dialog } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';
import DeployForm from '../Deploy';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

interface IProps {
    updatePipelineTypeAction: (pipelineType : string) => any;
    updateInstrialModelAction: (industrialModel: string) => any;
    updateScriptModeAction: (scriptMode: boolean) => any;
    updateModelAlgorithmAction: (modelAlgorithm: string) => any;
    pipelineType: string;
    trainingjobHyperparameters: any[];
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobVolumeSizeInGB : number;
    trainingjobInputData : any[];
    trainingjobOutputS3Uri : string;
    modelName: string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    modelDataUrl: string;
    modelEnvironment: any[];
    endpointName: string;
    endpointInstanceType : string;
    endpointAcceleratorType: string;
    endpointInitialInstanceCount: number;
    endpointInitialVariantWeight: number;
    greengrassComponentName: string;
    greengrassComponentVersion: string;
    greengrassDeploymentName: string;
    greengrassDeploymentTargetType: string;
    greengrassDeploymentTargetArn : string;
    greengrassDeploymentComponents: string;
    industrialModels: IIndustrialModel[];
    wizard?: boolean;
}

const PipelineForm: FunctionComponent<IProps> = (props) => {
    const [ pipelineType, setPipelineType ] = useState('0')
    const [ pipelineName, setPipelineName ] = useState('')
    const [ scriptMode, setScriptMode ] = useState(true)
    const [ processing, setProcessing ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var index = props.industrialModels.findIndex((item) => item.id === params.id)
    var algorithm = props.industrialModels[index].algorithm

    props.updateModelAlgorithmAction(algorithm)
    props.updateInstrialModelAction(params.id)

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdPipelineName')
            setPipelineName(event)
    }

    const onChangePipelineOptions = (event, value) => {
        setPipelineType(value)
        props.updatePipelineTypeAction(value)
    }

    const onChangeContainerOptions = (event, value) => {
        setScriptMode(value === 'BYOS')
        props.updateScriptModeAction(value === 'BYOS')
    }

    const onSubmit = () => {
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm
        var modelEnvironment = {}
        props.modelEnvironment.forEach((environment) => {
            var key = environment.key;
            var value = environment.value;
            modelEnvironment[key] = value;
        });
        
        var body = {}
        body['pipeline_name'] = pipelineName
        body['pipeline_type'] = pipelineType
        body['industrial_model'] = params.id
        body['model_algorithm'] = algorithm
        body['model_environment'] = modelEnvironment

        if(scriptMode) {
            body['script_mode'] = true
            var trainingjobHyperparameters = {}
            props.trainingjobHyperparameters.forEach((hyperparameter) => {
                var key = hyperparameter.key;
                var value = hyperparameter.value;
                trainingjobHyperparameters[key] = value;
            });
            body['training_job_hyperparameters'] = trainingjobHyperparameters
            body['training_job_instance_type'] = props.trainingjobInstanceType
            body['training_job_instance_count'] = props.trainingjobInstanceCount
            var trainingjobInputData = {}
            props.trainingjobInputData.forEach((inputData) => {
                var key = inputData.key;
                var value = inputData.value;
                trainingjobInputData[key] = value;
            });
            body['training_job_input_data'] = trainingjobInputData
            body['model_name'] = props.modelName
            body['endpoint_name'] = props.endpointName
            body['endpoint_instance_type'] = props.endpointInstanceType
            body['endpoint_initial_instance_count'] = props.endpointInitialInstanceCount
        }
        else {
            body['script_mode'] = false
            if(pipelineType === '0' || pipelineType === '1') {
                body['training_job_instance_type'] = props.trainingjobInstanceType
                body['training_job_instance_count'] = props.trainingjobInstanceCount
                body['training_job_volume_size_in_gb'] = props.trainingjobVolumeSizeInGB
                body['training_job_input_data'] = props.trainingjobInputData
                body['training_job_output_s3uri'] = props.trainingjobOutputS3Uri
                body['model_package_group_name'] = props.modelModelPackageGroupName
            }
            else
                body['model_package_arn'] = props.modelModelPackageArn
            
            body['endpoint_instance_type'] = props.endpointInstanceType
            body['endpoint_accelerator_type'] = props.endpointAcceleratorType
            body['endpoint_initial_instance_count'] = props.endpointInitialInstanceCount
            body['endpoint_initial_variant_weight'] = props.endpointInitialVariantWeight

            if(pipelineType === '0' || pipelineType === '2') {
                body['greengrass_component_name'] = props.greengrassComponentName
                body['greengrass_component_version'] = props.greengrassComponentVersion
                body['greengrass_deployment_name'] = props.greengrassDeploymentName
                body['greengrass_deployment_target_type'] = props.greengrassDeploymentTargetType
                body['greengrass_deployment_target_arn'] = props.greengrassDeploymentTargetArn
                body['greengrass_deployment_components'] = props.greengrassDeploymentComponents
            }

            if(pipelineType === '2')
                body['model_data_url'] = props.modelDataUrl            
        }
        setProcessing(true)
        axios.post('/pipeline', body,  { headers: {'content-type': 'application/json' }}) 
        .then((response) => {
            history.goBack()
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
            setProcessing(false);
        });
    }

    const onCancel = () => {
        history.goBack()
    }

    const renderPipelineOptions = () => {
        return (
            <RadioGroup onChange={onChangePipelineOptions}
                items={[
                    <RadioButton value='0' checked={pipelineType==='0'}>{t('industrial_models.pipeline.pipeline_type_1')}</RadioButton>, 
                    <RadioButton value='1' checked={pipelineType==='1'}>{t('industrial_models.pipeline.pipeline_type_2')}</RadioButton>,
                    <RadioButton value='2' checked={pipelineType==='2'}>{t('industrial_models.pipeline.pipeline_type_3')}</RadioButton>,
                    <RadioButton value='3' checked={pipelineType==='3'}>{t('industrial_models.pipeline.pipeline_type_4')}</RadioButton>
                ]}
            />
        )
    }

    const renderContainerOptions = () => {
        return (
            <RadioGroup onChange={onChangeContainerOptions}
                items={[
                    <RadioButton value='BYOS' checked={scriptMode}>{t('industrial_models.pipeline.pipeline_option_byos')}</RadioButton>, 
                    <RadioButton value='BYOC' checked={!scriptMode}>{t('industrial_models.pipeline.pipeline_option_byoc')}</RadioButton>,
                ]}
            />
        )
    }


    const renderPipeline = () => {
        return (
            <Stack>
                <FormField label={t('industrial_models.pipeline.pipeline_name')} controlId={uuidv4()}>
                    <Input type='text' value={pipelineName} onChange={(event) => onChange('formFieldIdPipelineName', event)}/>
                </FormField>
                {
                    !scriptMode && 
                    <FormField label={t('industrial_models.pipeline.pipeline_type')} controlId={uuidv4()}>
                        {renderPipelineOptions()}
                    </FormField>
                }
                <FormField label={t('industrial_models.pipeline.pipeline_options')} controlId={uuidv4()}>
                    {renderContainerOptions()}
                </FormField>
            </Stack>
        )
    }

    const steps0 = [
        {
            title: t('industrial_models.pipelines'),
            content: 
                renderPipeline()
        },
        {
            title: t('industrial_models.training_jobs'),
            content: 
                <TrainingJobForm wizard={true}/>
        },
        {
            title: t('industrial_models.deploys'),
            content: 
                <DeployForm wizard={true}/>
        }
    ]

    const steps1 = [
        {
            title: t('industrial_models.pipelines'),
            content: 
                renderPipeline()
        },
        {
            title: t('industrial_models.training_jobs'),
            content: 
                <TrainingJobForm wizard={true}/>
        },
        {
            title: t('industrial_models.models'),
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: t('industrial_models.endpoints'),
            content: 
                <EndpointForm wizard={true}/>
        },
        {
            title: t('industrial_models.greengrass_components'),
            content: 
                <GreengrassComponentForm wizard={true}/>
        },
        {
            title: t('industrial_models.greengrass_deployments'),
            content: 
                <GreengrassDeploymentForm wizard={true}/>
        }
    ];

    const steps2 = [
        {
            title: t('industrial_models.pipelines'),
            content: 
                renderPipeline()
        },
        {
            title: t('industrial_models.training_jobs'),
            content: 
                <TrainingJobForm wizard={true}/>
        },
        {
            title: t('industrial_models.models'),
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: t('industrial_models.endpoints'),
            content: 
                <EndpointForm wizard={true}/>
        }  
    ]

    const steps3 = [
        {
            title: t('industrial_models.pipelines'),
            content: 
                renderPipeline()
        },
        {
            title: t('industrial_models.models'),
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: t('industrial_models.endpoints'),
            content: 
                <EndpointForm wizard={true}/>
        },
        {
            title: t('industrial_models.greengrass_components'),
            content: 
                <GreengrassComponentForm wizard={true}/>
        },
        {
            title: t('industrial_models.greengrass_deployments'),
            content: 
                <GreengrassDeploymentForm wizard={true}/>
        }    
    ]
    
    const steps4 = [
        {
            title: t('industrial_models.pipelines'),
            content: 
                renderPipeline()
        },
        {
            title: t('industrial_models.models'),
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: t('industrial_models.endpoints'),
            content: 
                <EndpointForm wizard={true}/>
        } 
    ]

    var steps;

    if(scriptMode)
        steps = steps0;
    else if(pipelineType === '0')
        steps = steps1;
    else if(pipelineType === '1')
        steps = steps2;
    else if(pipelineType === '2')
        steps = steps3;
    else
        steps = steps4;
    
    return (
        <BrowserRouter>
            <Container>
                {
                    processing && <Dialog open={true}>
                        <Box p={3}>
                            <LoadingIndicator label={t('industrial_models.demo.processing')}/>
                        </Box>
                    </Dialog>
                }
                <Wizard steps={steps} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
            </Container>
        </BrowserRouter>
    )
}

const mapDispatchToProps = {
    updatePipelineTypeAction: UpdatePipelineType,
    updateInstrialModelAction: UpdateIndustrialModel,
    updateScriptModeAction: UpdateScriptMode,
    updateModelAlgorithmAction: UpdateModelAlgorithm
};

const mapStateToProps = (state: AppState) => ({
    pipelineType: state.pipeline.pipelineType,
    trainingjobHyperparameters: state.pipeline.trainingjobHyperparameters,
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobVolumeSizeInGB : state.pipeline.trainingjobVolumeSizeInGB,
    trainingjobInputData : state.pipeline.trainingjobInputData,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    modelName: state.pipeline.modelName,
    modelModelPackageGroupName : state.pipeline.modelModelPackageGroupName,
    modelModelPackageArn: state.pipeline.modelModelPackageArn,
    modelDataUrl: state.pipeline.modelDataUrl,
    modelEnvironment: state.pipeline.modelEnvironment,
    endpointName: state.pipeline.endpointName,
    endpointInstanceType : state.pipeline.endpointInstanceType,
    endpointAcceleratorType: state.pipeline.endpointAcceleratorType,
    endpointInitialInstanceCount: state.pipeline.endpointInitialInstanceCount,
    endpointInitialVariantWeight: state.pipeline.endpointInitialVariantWeight,
    greengrassComponentName: state.pipeline.greengrassComponentName,
    greengrassComponentVersion : state.pipeline.greengrassComponentVersion,
    greengrassDeploymentName: state.pipeline.greengrassDeploymentName,
    greengrassDeploymentTargetType: state.pipeline.greengrassDeploymentTargetType,
    greengrassDeploymentTargetArn : state.pipeline.greengrassDeploymentTargetArn,
    greengrassDeploymentComponents: state.pipeline.greengrassDeploymentComponents,
    industrialModels: state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PipelineForm);