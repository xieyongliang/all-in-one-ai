import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Stack, Text, ExpandableSection } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import {connect} from 'react-redux';
import { AppState } from '../../../store';
import { UpdateTrainingjobInstanceCount, UpdateTrainingjobInstanceType, UpdateTrainingjobOutputS3Uri, UpdateTrainingjobTrainingS3Uri, UpdateTrainingjobValidationS3Uri, UpdateTrainingjobTestS3Uri, UpdateTrainingjobHyperparameters } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';

interface IProps {
    updateTrainingjobInstanceTypeAction: (trainingjobInstanceType: string) => any;
    updateTrainingjobInstanceCountAction: (trainingjobInstanceCount: number) => any;
    updateTrainingjobTrainingS3UriAction: (trainingjobTrainingS3Uri: string) => any;
    updateTrainingjobValidationS3UriAction: (trainingjobValidationS3Uri: string) => any;
    updateTrainingjobTestS3UriAction: (trainingjobTestS3Uri: string) => any;
    updateTrainingjobHyperparametersAction: (trainingjobHyperparameters: string) => any;
    updateTrainingjobOutputS3UriAction: (trainingjobOutputS3Uri: string) => any;
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobTrainingS3Uri : string;
    trainingjobValidationS3Uri : string;
    trainingjobTestS3Uri : string;
    trainingjobHyperparameters : string;
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

const TrainingJobGluonCV5Form: FunctionComponent<IProps> = (props) => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ trainingImage, setTrainingImage ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.trainingjobInstanceType, value: props.trainingjobInstanceType} : {})
    const [ instanceCount, setInstanceCount ] = useState(props.wizard ? props.trainingjobInstanceCount : 1)
    const [ trainingS3Uri, setTrainingS3Uri ] = useState(props.wizard ? props.trainingjobTrainingS3Uri : '')
    const [ validationS3Uri, setValidationS3Uri ] = useState(props.wizard ? props.trainingjobValidationS3Uri : '')
    const [ testS3Uri, setTestS3Uri ] = useState(props.wizard ? props.trainingjobTestS3Uri : '')
    const [ hyperparameters, setHyperparameters ] = useState([{key:'', value:''}])
    const [ outputS3Uri, setOutputS3Uri ] = useState(props.wizard ? props.trainingjobOutputS3Uri : '')
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidTrainingJobName, setInvalidTrainingJobName ] = useState(false)
    const [ invalidInstanceType, setinvalidInstanceType ] = useState(false)
    const [ invalidInstanceCount, setInvalidInstanceCount ] = useState(false)
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
        if(id === 'formFieldIdTrainingS3Uri') {
            setTrainingS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobTrainingS3UriAction(event);
        }
        if(id === 'formFieldIdValidationS3Uri') {
            setValidationS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobValidationS3UriAction(event)
        }
        if(id === 'formFieldIdTestS3Uri') {
            setTestS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobTestS3UriAction(event)
        }
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobOutputS3UriAction(event)
        }
    }

    const onChangeHyperparameters = (id: string, event: any, index : number) => {
        var copyHyparameters = JSON.parse(JSON.stringify(hyperparameters));
        copyHyparameters[index][id] = event
        setHyperparameters(copyHyparameters)
    }

    const onSubmit = () => {
        if(trainingJobName === '')
            setInvalidTrainingJobName(true)
        else if(selectedInstanceType.value === undefined)
            setinvalidInstanceType(true)
        else if(instanceCount <= 0)
            setInvalidInstanceCount(true)
        else if(trainingS3Uri === '')
            setInvalidImagesS3Uri(true)
        else if(validationS3Uri === '')
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
                'training_s3uri': trainingS3Uri,
                'validation_s3uri': validationS3Uri,
                'hyperparameters': hyperparameters,
                'cfg_s3uri': testS3Uri,
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
                </FormSection>
                <FormSection header='Input data configuration'>
                    <FormField label='Training S3Uri' controlId='formFieldIdTrainingS3Uri'>
                        <Input value={trainingS3Uri} required={true} invalid={invalidImagesS3Uri} onChange={(event) => onChange('formFieldIdTrainingS3Uri', event)}/>
                    </FormField>
                    <FormField label='Validation S3Uri' controlId='formFieldIdValidationS3Uri'>
                        <Input value={validationS3Uri} required={true} invalid={invalidLabelsS3Uri} onChange={(event) => onChange('formFieldIdValidationS3Uri', event)} />
                    </FormField>
                    <FormField label='Test S3Uri' controlId='formFieldIdTestS3Uri'>
                        <Input value={testS3Uri} required={true} placeholder={'default'} onChange={(event) => onChange('formFieldIdTestS3Uri', event)} />
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

    const onAddHyperparameter = () => {
        var copyHyparameters = JSON.parse(JSON.stringify(hyperparameters));
        copyHyparameters.push({key:'', value:''});
        setHyperparameters(copyHyparameters);
        var hyperparameter = {}
        if(copyHyparameters.length > 0) {
            copyHyparameters.forEach((item) => {
                if(item['key'] === '') {
                    alert('key in hyperparameter cannot be empty');
                    return;
                }
                hyperparameter[item['key']] = item['value'];
            })
        }
        props.updateTrainingjobHyperparametersAction(JSON.stringify(hyperparameter))
    }

    const onRemoveHyperparameter = (index) => {
        var copyHyparameters = JSON.parse(JSON.stringify(hyperparameters));
        copyHyparameters.splice(index, 1);
        setHyperparameters(copyHyparameters);
    }

    const renderHyperparameters = () => {
        return (
            <ExpandableSection header="Hyperparameters - optional">
                <Stack>
                    {
                        hyperparameters.length>0 && 
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Key </Text>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Text> Value </Text> 
                            </Grid>
                        </Grid>
                    }
                    {
                        hyperparameters.map((item, index) => (
                            <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.key} onChange={(event) => onChangeHyperparameters('key', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type='text' value={item.value} onChange={(event) => onChangeHyperparameters('value', event, index)}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveHyperparameter(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant='link' size='large' onClick={onAddHyperparameter}>Add hyperparameter</Button>
                </Stack>
            </ExpandableSection>  
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
    updateTrainingjobTrainingS3UriAction: UpdateTrainingjobTrainingS3Uri,
    updateTrainingjobValidationS3UriAction: UpdateTrainingjobValidationS3Uri,
    updateTrainingjobTestS3UriAction: UpdateTrainingjobTestS3Uri,
    updateTrainingjobHyperparametersAction: UpdateTrainingjobHyperparameters,
    updateTrainingjobOutputS3UriAction: UpdateTrainingjobOutputS3Uri
};

const mapStateToProps = (state: AppState) => ({
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobTrainingS3Uri : state.pipeline.trainingjobTrainingS3Uri,
    trainingjobValidationS3Uri : state.pipeline.trainingjobValidationS3Uri,
    trainingjobWeightsS3Uri : state.pipeline.trainingjobWeightsS3Uri,
    trainingjobHyperparameters: state.pipeline.trainingjobHyperparameters,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TrainingJobGluonCV5Form);