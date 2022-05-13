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
import { UpdateModelAlgorithm, UpdatePipelineType } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { Box, Dialog } from '@material-ui/core';

interface IProps {
    updatePipelineTypeAction: (pipelineType : string) => any;
    updateModelAlgorithmAction: (modelAlgorithm: string) => any;
    pipelineType: string;
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobVolumeSizeInGB : number;
    trainingjobImagesS3Uri : string;
    trainingjobLabelsS3Uri : string;
    trainingjobWeightsS3Uri : string;
    trainingjobCfgS3Uri : string;
    trainingjobOutputS3Uri : string;
    modelModelPackageGroupName: string;
    modelModelPackageArn: string;
    modelDataUrl: string;
    modelEnvironment: Object;
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
    const [ processing, setProcessing ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var index = props.industrialModels.findIndex((item) => item.id === params.id)
    var algorithm = props.industrialModels[index].algorithm

    props.updateModelAlgorithmAction(algorithm)

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdPipelineName')
            setPipelineName(event)
    }

    const onChangeOptions = (event, value) => {
        setPipelineType(value)
        props.updatePipelineTypeAction(value)
    }

    const onSubmit = () => {
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm
        var environment = props.modelEnvironment
        
        var body = {}
        body['pipeline_name'] = pipelineName
        body['pipeline_type'] = pipelineType
        body['industrial_model'] = params.id
        body['model_algorithm'] = algorithm
        body['environment'] = environment
        if(pipelineType === '0' || pipelineType === '1') {
            body['training_job_instance_type'] = props.trainingjobInstanceType
            body['training_job_instance_count'] = props.trainingjobInstanceCount
            body['training_job_volume_size_in_gb'] = props.trainingjobVolumeSizeInGB
            body['training_job_images_s3uri'] = props.trainingjobImagesS3Uri
            body['training_job_labels_s3uri'] = props.trainingjobLabelsS3Uri
            body['training_job_weights_s3uri'] = props.trainingjobWeightsS3Uri
            body['training_job_cfg_s3uri'] = props.trainingjobCfgS3Uri
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
        
        setProcessing(true)
        axios.post('/pipeline', body,  { headers: {'content-type': 'application/json' }}) 
        .then((response) => {
            history.goBack()
        }, (error) => {
            alert('Error occured, please check and try it again');
            console.log(error);
            setProcessing(false)
        });
    }

    const onCancel = () => {
        history.goBack()
    }

    const renderPipelineOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='0' checked={pipelineType==='0'}>Both training and inference and deploy in both cloud and edge</RadioButton>, 
                    <RadioButton value='1' checked={pipelineType==='1'}>Both training and inference and deploy only in cloud</RadioButton>,
                    <RadioButton value='2' checked={pipelineType==='2'}>Only inference and deploy in both cloud and edge</RadioButton>,
                    <RadioButton value='3' checked={pipelineType==='3'}>Only inference and deploy only in cloud</RadioButton>
                ]}
            />
        )
    }

    const renderPipeline = () => {
        return (
            <Stack>
                <FormField label='Pipeline name' controlId='formFieldIdPipelineName'>
                    <Input type='text' value={pipelineName} onChange={(event) => onChange('formFieldIdPipelineName', event)}/>
                </FormField>
                <FormField label='Pipeline type' controlId='formFieldIdPipelineType'>
                    {renderPipelineOptions()}
                </FormField>
            </Stack>
        )
    }

    const steps = [
        {
            title: 'Pipeline',
            content: 
                renderPipeline()
        },
        algorithm === 'yolov5' && {
            title: 'Training job',
            content: 
                <TrainingJobForm wizard={true}/>
        },
        {
            title: 'Model',
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: 'Endpoint',
            content: 
                <EndpointForm wizard={true}/>
        },
        {
            title: 'Greengrass component',
            content: 
                <GreengrassComponentForm wizard={true}/>
        },
        {
            title: 'Greengrass deployment',
            content: 
                <GreengrassDeploymentForm wizard={true}/>
        }
    ];

    const steps1 = [
        {
            title: 'Pipeline',
            content: 
                renderPipeline()
        },
        algorithm === 'yolov5' && {
            title: 'Training job',
            content: 
                <TrainingJobForm wizard={true}/>
        },
        {
            title: 'Model',
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: 'Endpoint',
            content: 
                <EndpointForm wizard={true}/>
        }  
    ]

    const steps2 = [
        {
            title: 'Pipeline',
            content: 
                renderPipeline()
        },
        {
            title: 'Model',
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: 'Endpoint',
            content: 
                <EndpointForm wizard={true}/>
        },
        {
            title: 'Greengrass component',
            content: 
                <GreengrassComponentForm wizard={true}/>
        },
        {
            title: 'Greengrass deployment',
            content: 
                <GreengrassDeploymentForm wizard={true}/>
        }    
    ]
    
    const steps3 = [
        {
            title: 'Pipeline',
            content: 
                renderPipeline()
        },
        {
            title: 'Model',
            content: 
                <ModelForm wizard={true}/>
        },
        {
            title: 'Endpoint',
            content: 
                <EndpointForm wizard={true}/>
        } 
    ]

    if(pipelineType === '0') {
        return (
            <BrowserRouter>
                <Container>
                    {
                        processing && <Dialog open={true}>
                            <Box p={3}>
                                <LoadingIndicator label='Processing...'/>
                            </Box>
                        </Dialog>
                    }
                    <Wizard steps={steps} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(pipelineType === '1') {
        return (
            <BrowserRouter>
                <Container>
                    {
                        processing && <Dialog open={true}>
                            <Box p={3}>
                                <LoadingIndicator label='Processing...'/>
                            </Box>
                        </Dialog>
                    }
                    <Wizard steps={steps1} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else if(pipelineType === '2') {
        return (
            <BrowserRouter>
                <Container>
                    {
                        processing && <Dialog open={true}>
                            <Box p={3}>
                                <LoadingIndicator label='Processing...'/>
                            </Box>
                         </Dialog>
                    }
                    <Wizard steps={steps2} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
    else{
        return (
            <BrowserRouter>
                <Container>
                    {
                        processing && <Dialog open={true}>
                            <Box p={3}>
                                <LoadingIndicator label='Processing...'/>
                            </Box>
                        </Dialog>
                    }
                    <Wizard steps={steps3} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
                </Container>
            </BrowserRouter>
        )
    }
}

const mapDispatchToProps = {
    updatePipelineTypeAction: UpdatePipelineType,
    updateModelAlgorithmAction: UpdateModelAlgorithm
};

const mapStateToProps = (state: AppState) => ({
    pipelineType: state.pipeline.pipelineType,
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobVolumeSizeInGB : state.pipeline.trainingjobVolumeSizeInGB,
    trainingjobImagesS3Uri : state.pipeline.trainingjobImagesS3Uri,
    trainingjobLabelsS3Uri : state.pipeline.trainingjobLabelsS3Uri,
    trainingjobWeightsS3Uri : state.pipeline.trainingjobWeightsS3Uri,
    trainingjobCfgS3Uri : state.pipeline.trainingjobCfgS3Uri,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    modelModelPackageGroupName : state.pipeline.modelModelPackageGroupName,
    modelModelPackageArn: state.pipeline.modelModelPackageArn,
    modelDataUrl: state.pipeline.modelDataUrl,
    modelEnvironment: state.pipeline.modelEnvironment,
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