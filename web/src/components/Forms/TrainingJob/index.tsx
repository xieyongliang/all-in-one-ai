import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Stack, Text } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import {connect} from 'react-redux';
import { AppState } from '../../../store';
import { UpdateTrainingjobImageS3Uri, UpdateTrainingjobInstanceCount, UpdateTrainingjobInstanceType, UpdateTrainingjobLabelsS3Uri, UpdateTrainingjobVolumeSizeInGB, UpdateTrainingjobWeightsS3Uri, UpdateTrainingjobCfgS3Uri, UpdateTrainingjobOutputS3Uri } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';

interface IProps {
    updateTrainingjobInstanceTypeAction: (trainingjobInstanceType: string) => any;
    updateTrainingjobInstanceCountAction: (trainingjobInstanceCount: number) => any;
    updateTrainingjobVolumeSizeInGBAction: (trainingjobVolumeSizeInGB: number) => any;
    updateTrainingjobImageS3UriAction: (trainingjobImagesS3Uri: string) => any;
    updateTrainingjobLabelsS3UriAction: (trainingjobLabelsS3Uri: string) => any;
    updateTrainingjobWeightsS3UriAction: (trainingjobWeightsS3Uri: string) => any;
    updateTrainingjobCfgS3UriAction: (trainingjobCfgS3Uri: string) => any;
    updateTrainingjobOutputS3UriAction: (trainingjobOutputS3Uri: string) => any;
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobVolumeSizeInGB : number;
    trainingjobImagesS3Uri : string;
    trainingjobLabelsS3Uri : string;
    trainingjobWeightsS3Uri : string;
    trainingjobCfgS3Uri : string;
    trainingjobOutputS3Uri : string;
    wizard?: boolean;
    industrialModels: IIndustrialModel[];
}

const optionsInstance : SelectOption[]= [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12xlarge', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' } 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.g4dn.xlarge', value: 'ml.g4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' }
        ]
    }
];

const TrainingJobForm: FunctionComponent<IProps> = (props) => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ trainingImage, setTrainingImage ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.trainingjobInstanceType, value: props.trainingjobInstanceType} : {})
    const [ instanceCount, setInstanceCount ] = useState(props.wizard ? props.trainingjobInstanceCount : 1)
    const [ volumeSizeInGB, setVolumeSizeInGB ] = useState(props.wizard ? props.trainingjobVolumeSizeInGB : 30)
    const [ imagesS3Uri, setImagesS3Uri ] = useState(props.wizard ? props.trainingjobImagesS3Uri : '')
    const [ labelsS3Uri, setLabelsS3Uri ] = useState(props.wizard ? props.trainingjobLabelsS3Uri : '')
    const [ weightsS3Uri, setWeightsS3Uri ] = useState(props.wizard ? props.trainingjobWeightsS3Uri : '')
    const [ cfgS3Uri, setCfgS3Uri ] = useState(props.wizard ? props.trainingjobCfgS3Uri : '')
    const [ outputS3Uri, setOutputS3Uri ] = useState(props.wizard ? props.trainingjobOutputS3Uri : '')
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidTrainingJobName, setInvalidTrainingJobName ] = useState(false)
    const [ invalidInstanceType, setinvalidInstanceType ] = useState(false)
    const [ invalidInstanceCount, setInvalidInstanceCount ] = useState(false)
    const [ invalidVolumeSizeInGB, setInvalidVolumeSizeInGB ] = useState(false)
    const [ invalidImagesS3Uri, setInvalidImagesS3Uri ] = useState(false)
    const [ invalidLabelsS3Uri, setInvalidLabelsS3Uri ] = useState(false)
    const [ invalidOutputS3Uri, setInvalidOutputS3Uri ] = useState(false)
    const [ processing, setProcessing ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdTrainingJobName')
            setTrainingJobName(event);
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
            if(props.wizard)
                props.updateTrainingjobInstanceTypeAction(event.target.value);
        }
        if(id === 'formFieldIdTrainingImage')
            setTrainingImage(event);
        if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(parseInt(event));
            if(props.wizard)
                props.updateTrainingjobInstanceCountAction(parseInt(event));
        }
        if(id === 'formFieldIdVolumeSizeInGB') {
            setVolumeSizeInGB(parseInt(event));
            if(props.wizard)
                props.updateTrainingjobVolumeSizeInGBAction(parseInt(event));
        }
        if(id === 'formFieldIdImagesS3Uri') {
            setImagesS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobImageS3UriAction(event);
        }
        if(id === 'formFieldIdLabelsS3Uri') {
            setLabelsS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobLabelsS3UriAction(event)
        }
        if(id === 'formFieldIdWeightsS3Uri') {
            setWeightsS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobWeightsS3UriAction(event)
        }
        if(id === 'formFieldIdCfgS3Uri') {
            setCfgS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobCfgS3UriAction(event)
        }
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobOutputS3UriAction(event)
        }
    }

    const onSubmit = () => {
        if(trainingJobName === '')
            setInvalidTrainingJobName(true)
        else if(selectedInstanceType.value === undefined)
            setinvalidInstanceType(true)
        else if(instanceCount <= 0)
            setInvalidInstanceCount(true)
        else if(volumeSizeInGB <= 0)
            setInvalidVolumeSizeInGB(true)
        else if(imagesS3Uri === '')
            setInvalidImagesS3Uri(true)
        else if(labelsS3Uri === '')
            setInvalidLabelsS3Uri(true)
        else if(outputS3Uri === '')
            setInvalidOutputS3Uri(true)
        else {
            var index = props.industrialModels.findIndex((item) => item.id === params.id)
            var algorithm = props.industrialModels[index].algorithm

            var body = {
                'training_job_name' : trainingJobName,
                'training_image': trainingImage,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'volume_size_in_gb': volumeSizeInGB,
                'images_s3uri': imagesS3Uri,
                'labels_s3uri': labelsS3Uri,
                'weights_s3uri': weightsS3Uri,
                'cfg_s3uri': cfgS3Uri,
                'output_s3uri': outputS3Uri
            }
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body['tags'] = tags
            setProcessing(true)
            axios.post('/trainingjob', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.goBack()
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessing(false);
            });    
        }
    }

    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        tags.push({key:'', value:''});
        setForcedRefresh(!forcedRefresh);
    }

    const onRemoveTag = (index) => {
        tags.splice(index, 1);
        setForcedRefresh(!forcedRefresh);
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const renderTrainingJobSetting = () => {
        if(!wizard) {
            return (
                <FormSection header='Job settings'>
                    <FormField label='Job name' controlId='formFieldIdJobName' hintText='Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.'>
                        <Input type='text' invalid={invalidTrainingJobName} required={true} onChange={(event) => onChange('formFieldIdTrainingJobName', event)}/>
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderAlgorithmOptions = () => {
        return (
            <FormSection header='Algorithm options'>
                <FormField label='Container' controlId='formFieldIdTrainingImage' hintText='The registry path where the training image is stored in Amazon ECR.'>
                    <Input type='text' placeholder='default' required={true} onChange={(event) => onChange('formFieldIdTrainingImage', event)}/>
                </FormField>
            </FormSection>
        )
    }

    const renderTrainingJobTag = () => {
        if(!wizard)
            return (
                <FormSection header='Tags - optional'>
                    {
                        tags.length>0 && 
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Key </Text>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text> Value </Text> 
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Text>  </Text>
                                </Grid>
                            </Grid>
                    }
                    {
                        tags.map((tag, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.key}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={tag.value}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddTag}>Add tag</Button>
                </FormSection>
            )
        else
            return ''
    }

    const renderTrainingJobContent = () => {
        return (
            <Stack>
                <FormSection header='Resource configuration'>
                    <FormField label='Instance type' controlId='formFieldIdInstanceType'>
                    <Select
                            placeholder='Choose an option'
                            options={optionsInstance}
                            selectedOption={selectedInstanceType}
                            invalid={invalidInstanceType}
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                    </FormField>
                    <FormField label='Instance count' controlId='formFieldIdInstanceCount'>
                        <Input type='number' value={instanceCount} required={true} invalid={invalidInstanceCount} onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                    </FormField>
                    <FormField label='Additional storage volume per instance (GB)' controlId='formFieldIdVolumeSizeInGB'>
                        <Input type='number' value={volumeSizeInGB} required={true} invalid={invalidVolumeSizeInGB} onChange={(event) => onChange('formFieldIdVolumeSizeInGB', event)}/>
                    </FormField>
                </FormSection>
                <FormSection header='Input data configuration'>
                    <FormField label='Images S3Uri' controlId='formFieldIdImagesS3Uri'>
                        <Input value={imagesS3Uri} required={true} invalid={invalidImagesS3Uri} onChange={(event) => onChange('formFieldIdImagesS3Uri', event)}/>
                    </FormField>
                    <FormField label='Lables S3Uri' controlId='formFieldIdLabelsPrefix'>
                        <Input value={labelsS3Uri} required={true} invalid={invalidLabelsS3Uri} onChange={(event) => onChange('formFieldIdLabelsS3Uri', event)} />
                    </FormField>
                    <FormField label='Weights S3Uri' controlId='formFieldIdWeightsS3Uri'>
                        <Input value={weightsS3Uri} required={true} placeholder={'default'} onChange={(event) => onChange('formFieldIdWeightsS3Uri', event)}/>
                    </FormField>
                    <FormField label='Cfg S3Uri' controlId='formFieldIdCfgS3Uri'>
                        <Input value={cfgS3Uri} required={true} placeholder={'default'} onChange={(event) => onChange('formFieldIdCfgS3Uri', event)} />
                    </FormField>
                </FormSection>
                <FormSection header='Output data configuration'>
                    <FormField label='S3 output path' controlId='formFieldIdOutputS3Uri'>
                        <Input value={outputS3Uri} placeholder='s3://' required={true} invalid={invalidOutputS3Uri} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)} />
                    </FormField>
                </FormSection>
            </Stack>
        )
    }

    if(wizard) {
        return (
            <Stack>
                { renderTrainingJobSetting() }
                { renderAlgorithmOptions() }
                { renderTrainingJobContent() }
                { renderTrainingJobTag() }
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create training job'
                description='When you create a training job, Amazon SageMaker sets up the distributed compute cluster, performs the training, and deletes the cluster when training has completed. The resulting model artifacts are stored in the location you specified when you created the training job.'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                    </div>
                }>            
                { renderTrainingJobSetting() }
                { renderAlgorithmOptions() }
                { renderTrainingJobContent() }
                { renderTrainingJobTag() }
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateTrainingjobInstanceTypeAction: UpdateTrainingjobInstanceType,
    updateTrainingjobInstanceCountAction: UpdateTrainingjobInstanceCount,
    updateTrainingjobVolumeSizeInGBAction: UpdateTrainingjobVolumeSizeInGB,
    updateTrainingjobImageS3UriAction: UpdateTrainingjobImageS3Uri,
    updateTrainingjobLabelsS3UriAction: UpdateTrainingjobLabelsS3Uri,
    updateTrainingjobWeightsS3UriAction: UpdateTrainingjobWeightsS3Uri,
    updateTrainingjobCfgS3UriAction: UpdateTrainingjobCfgS3Uri,
    updateTrainingjobOutputS3UriAction: UpdateTrainingjobOutputS3Uri
};

const mapStateToProps = (state: AppState) => ({
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobVolumeSizeInGB : state.pipeline.trainingjobVolumeSizeInGB,
    trainingjobImagesS3Uri : state.pipeline.trainingjobImagesS3Uri,
    trainingjobLabelsS3Uri : state.pipeline.trainingjobLabelsS3Uri,
    trainingjobWeightsS3Uri : state.pipeline.trainingjobWeightsS3Uri,
    trainingjobCfgS3Uri : state.pipeline.trainingjobCfgS3Uri,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TrainingJobForm);