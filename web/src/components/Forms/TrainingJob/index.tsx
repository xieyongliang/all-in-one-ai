import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Stack, Text, RadioGroup, RadioButton, Toggle } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import {connect} from 'react-redux';
import { AppState } from '../../../store';
import { UpdateTrainingjobInputData, UpdateTrainingjobInstanceCount, UpdateTrainingjobInstanceType, UpdateTrainingjobVolumeSizeInGB, UpdateTrainingjobOutputS3Uri, UpdateTrainingjobHyperparameters } from '../../../store/pipelines/actionCreators';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';
import './index.scss';

const instanceOptions : SelectOption[]= [
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
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge'},
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge'},
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge'},
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge'},
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge'},
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge'},
            { label: 'ml.g4dn.xlarge', value: 'ml.g4dn.xlarge' },
            { label: 'ml.g4dn.2xlarge', value: 'ml.g4dn.2xlarge' },
            { label: 'ml.g4dn.4xlarge', value: 'ml.g4dn.4xlarge' },
            { label: 'ml.g4dn.8xlarge', value: 'ml.g4dn.8xlarge' },
            { label: 'ml.g4dn.12xlarge', value: 'ml.g4dn.12xlarge' },
            { label: 'ml.g4dn.16xlarge', value: 'ml.g4dn.16xlarge' }
        ]
    }
];

const timeUnitOptions : SelectOption[] = [
    {
        label: 'seconds',
        value: 'seconds'
    },
    {
        label: 'minutes',
        value: 'minutes'
    },
    {
        label: 'hours',
        value: 'hours'
    },
    {
        label: 'days',
        value: 'days'
    }
]

const inputDataOptions = {
    'yolov5': [
        {
            key: 'images',
            value: ''
        },
        {
            key: 'labels',
            value: ''
        },
        {
            key: 'cfg',
            value: ''
        },
        {
            key: 'weights',
            value: ''
        }
    ],
    'gluoncv': [
        {
            key: 'train',
            value: ''
        },
        {
            key: 'val',
            value: ''
        },
        {
            key: 'test',
            value: ''
        }
    ],
    'cpt': [
        {
            key: 'train',
            value: ''
        },
        {
            key: 'validation',
            value: ''
        },
        {
            key: 'test',
            value: ''
        }
    ]
}

interface IProps {
    updateTrainingjobInstanceTypeAction: (trainingjobInstanceType: string) => any;
    updateTrainingjobInstanceCountAction: (trainingjobInstanceCount: number) => any;
    updateTrainingjobVolumeSizeInGBAction: (trainingjobVolumeSizeInGB: number) => any;
    updateTrainingjobHyperparametersAction: (hyperparameters: any[]) => any;
    updateTrainingjobInputDataAction: (trainingjobInputData: any[]) => any;
    updateTrainingjobOutputS3UriAction: (trainingjobOutputS3Uri: string) => any;
    trainingjobInstanceType : string;
    trainingjobInstanceCount : number;
    trainingjobVolumeSizeInGB : number;
    trainingjobHyperparameters: any[];
    trainingjobInputData : any[];
    trainingjobOutputS3Uri : string;
    scriptMode: boolean;
    industrialModels: IIndustrialModel[];
    industrialModel: string;
    wizard?: boolean;
}

const TrainingJobForm: FunctionComponent<IProps> = (props) => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ trainingImage, setTrainingImage ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>(props.wizard ? {label: props.trainingjobInstanceType, value: props.trainingjobInstanceType} : {})
    const [ instanceCount, setInstanceCount ] = useState(props.wizard ? props.trainingjobInstanceCount : 1)
    const [ volumeSizeInGB, setVolumeSizeInGB ] = useState(props.wizard ? props.trainingjobVolumeSizeInGB : 30)
    const [ outputS3Uri, setOutputS3Uri ] = useState(props.wizard ? props.trainingjobOutputS3Uri : '')
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ processing, setProcessing ] = useState(false)
    const [ scriptMode, setScriptMode ]  = useState(props.wizard ? props.scriptMode : true)
    const [ hyperparameters, setHyperParameters ] = useState(props.wizard? props.trainingjobHyperparameters : [])
    const [ checkpointS3Uri, setCheckpointS3Uri ] = useState('')
    const [ checkpointLocalPath, setCheckpointLocalPath ] = useState('')
    const [ enableManagedSpotTraining, setEnableManagedSpotTraining ] = useState(false)
    const [ selectedWaitiUnit, setSelectedWaitUnit ] = useState<SelectOption>({label: 'hours', value: 'hours'})
    const [ maxWaitTime, setMaxWaitTime ] = useState(48)
    const [ selectedRuntimeUnit, setRuntimeUnit ] = useState<SelectOption>({label: 'hours', value: 'hours'})
    const [ maxRuntime, setMaxRuntime ] = useState(24)

    const history = useHistory();

    var params : PathParams = useParams();
    var industrialModel = props.wizard ? props.industrialModels.find((item) => item.id === props.industrialModel) : props.industrialModels.find((item) => item.id === params.id);
    var algorithm = industrialModel.algorithm;
    const [ inputData ] = useState(inputDataOptions[algorithm]);

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdTrainingJobName') {
            setTrainingJobName(event);
        }
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
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
            if(props.wizard)
                props.updateTrainingjobOutputS3UriAction(event)
        }
        if(id === 'formFieldIdStopMaxRuntimeTime') {
            setMaxRuntime(event)
        }
        if(id === 'formFieldIdStopRuntimeUnit') {
            setRuntimeUnit({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdCheckpointLocalPath') {
            setCheckpointLocalPath(event)
        }
        if(id === 'formFieldIdCheckpointS3Uri') {
            setCheckpointS3Uri(event)
        }
        if(id === 'formFieldIdSpotTrainingMaxWaitTime') {
            setMaxWaitTime(event)
        }
        if(id === 'formFieldIdSpotTrainingUnit') {
            setSelectedWaitUnit({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdSpotTrainingEnabled') {
            setEnableManagedSpotTraining(event)
        }
    }

    const onChangeHyperparameters = (index, id, event) => {
        if(id === 'key')
            hyperparameters[index].key = event
        else
            hyperparameters[index].value = event
        props.updateTrainingjobHyperparametersAction(hyperparameters)   
    }

    const onChangeInputData = (id, event) => {
        var channel = inputData.find((channel) => channel.key === id)
        channel.value = event
        props.updateTrainingjobInputDataAction(inputData)
    }

    const onSubmit = () => {            
        if(!scriptMode) {
            var maxRuntimeInSeconds = maxRuntime
            if(selectedRuntimeUnit === 'Days')
                maxRuntimeInSeconds *= 24 * 60 * 60
            else if(selectedRuntimeUnit === 'Hours')
                maxRuntimeInSeconds *= 60 * 60
            else if(selectedRuntimeUnit === 'Minutes')
                maxRuntimeInSeconds *= 60
            var maxWaitTimeInSeconds = maxWaitTime
            if(selectedWaitiUnit === 'Days')
                maxWaitTimeInSeconds *= 24 * 60 * 60
            else if(selectedWaitiUnit === 'Hours')
                maxWaitTimeInSeconds *= 60 * 60
            else if(selectedWaitiUnit === 'Minutes')
                maxWaitTimeInSeconds *= 60
            var body1 = {
                'training_job_name' : trainingJobName,
                'training_image': trainingImage,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'volume_size_in_gb': volumeSizeInGB,
                'output_s3uri': outputS3Uri,
                'inputs': {},
                'checkpoint_s3uri': checkpointS3Uri,
                'checkpoint_localpath': checkpointLocalPath,
                'enable_managed_spot_training': enableManagedSpotTraining,
                'max_waittime_in_seconds': maxWaitTimeInSeconds,
                'max_runtime_in_seconds': maxRuntimeInSeconds
            }
            inputData.forEach((channel) => {
                var key = channel.key;
                var value = channel.value;
                body1['inputs'][key] = value;
            });
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body1['tags'] = tags
            setProcessing(true)
            axios.post('/trainingjob', body1,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                        alert('Error occured, please check and try it again');
                        console.log(error);
                        setProcessing(false);
                    }
                );
        }
        else {
            var body2 = {
                'training_job_name' : trainingJobName,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'inputs': {},
                'model_hyperparameters' : {}
            }
            inputData.forEach((channel) => {
                var key = channel.key;
                var value = channel.value;
                body2['inputs'][key] = value
            });
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body2['tags'] = tags
            hyperparameters.forEach((hyperparameter) => {
                body2['model_hyperparameters'][hyperparameter.key] = hyperparameter.value
            })
            setProcessing(true)
            console.log(body2)
            axios.post('/train', body2,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                        alert('Error occured, please check and try it again');
                        console.log(error);
                        setProcessing(false);
                    }
                );
        }
    }

    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        var copyTags = JSON.parse(JSON.stringify(tags))
        copyTags.push({key:'', value:''});
        setTags(copyTags);
    }

    const onRemoveTag = (index) => {
        var copyTags = JSON.parse(JSON.stringify(tags))
        copyTags.splice(index, 1);
        setTags(copyTags);
    }

    const onAddHyperparameter = () => {
        var copyHyperparameters = JSON.parse(JSON.stringify(hyperparameters))
        copyHyperparameters.push({key:'', value:''});
        setHyperParameters(copyHyperparameters)
    }

    const onRemoveHyperparameter = (index) => {
        var copyHyperparameters = JSON.parse(JSON.stringify(hyperparameters))
        copyHyperparameters.splice(index, 1);
        setHyperParameters(copyHyperparameters)
    }

    var wizard : boolean
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const onChangeOptions = (event) => {
        setScriptMode(event.target.value === 'BYOS')
    }

    const renderTrainingJobSetting = () => {
        return (
            <FormSection header='Job settings'>
                {
                    (!wizard) && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>Job name</Text>
                            <Text variant='small'>Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.</Text>
                            <div style={{marginTop: '5px', marginBottom: '5px'}}>
                                <Input type='text' value={trainingJobName} required={true} onChange={(event) => onChange('formFieldIdTrainingJobName', event)}/>
                            </div>
                        </Grid>
                    </Grid>
                }
                {
                    !wizard && 
                    <div className='subheader'>
                        <div className='title'>
                            Algorithm specification
                        </div>
                    </div>
                }
                {
                    !wizard && 
                    <div style={{marginBottom: '5px'}}>
                        <FormField controlId='formFieldIdTrainingMode' description='Use SageMaker built-in container image or your own container image.'>
                            <RadioGroup onChange={onChangeOptions}
                                items={[
                                    <RadioButton value='BYOS' checked={scriptMode}>Bring your own script.</RadioButton>, 
                                    <RadioButton value='BYOC' checked={!scriptMode}>Bring your own container.</RadioButton>,
                                ]}
                            /> 
                        </FormField>
                    </div>
                }
                {
                    !scriptMode &&
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>Container</Text>
                            <div style={{marginTop: '5px', marginBottom: '5px'}}>
                                <Input type='text' required={true} onChange={(event) => onChange('formFieldIdTrainingImage', event)}/>
                            </div>
                        </Grid>
                    </Grid>
                }
                <div className='subheader'>
                    <div className='title'>
                        Resource configuration
                    </div>
                </div>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>Instance type</Text>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>Instance count</Text>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}/>
                    <Grid item xs={2} sm={2} md={2}>
                    <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                            <Select
                                placeholder='Choose an option'
                                options={instanceOptions}
                                selectedOption={selectedInstanceType}
                                onChange={(event) => onChange('formFieldIdInstanceType', event)}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                            <Input type='number' value={instanceCount} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}/>
                    {
                        !scriptMode && 
                        <Grid item xs={2} sm={4} md={4}>
                            <Text variant='p'>Additional storage volume per instance (GB)</Text>
                            <div style={{marginTop: '5px', marginBottom: '5px'}}>
                                <Input type='number' value={volumeSizeInGB} required={true} onChange={(event) => onChange('formFieldIdVolumeSizeInGB', event)}/>
                            </div>
                        </Grid>
                    }
                </Grid>
                {
                    scriptMode && <div style={{margin: '15px'}}/>
                }
                {
                    !scriptMode && 
                    <div className='subheader'>
                        <div className='title'>
                            Stop condiction
                        </div>
                    </div>
                }
                {
                    !scriptMode && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={8} md={8}>
                            <Text>Maximum runtime</Text>
                        </Grid>
                        <Grid item xs={2} sm={3} md={3}>
                            <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                                <Input type='number' value={maxRuntime} required={true} onChange={(event) => onChange('formFieldIdStopMaxRuntimeTime', event)}/>
                            </div>
                        </Grid>
                        <Grid item xs={2} sm={1} md={1}>
                            <div style={{marginTop: '-20px', marginBottom: '-5px'}}>
                                <Select
                                    placeholder='Choose an option'
                                    options={timeUnitOptions}
                                    selectedOption={selectedRuntimeUnit}
                                    onChange={(event) => onChange('formFieldIdStopRuntimeUnit', event)}
                                />
                            </div>
                        </Grid>
                    </Grid>
                }
            </FormSection>
        )
    }

    const renderHyperparameters = () => {
        return (
            <FormSection header='Hyperparameters' description='You can use hyperparameters to finely control training. Choose Add hyperparameter to get started.'>
                {
                    hyperparameters.length>0 && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }}>
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
                    hyperparameters.map((hyperparameter, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={hyperparameter.key} onChange={(event) => onChangeHyperparameters(index, 'key', event)}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={hyperparameter.value} onChange={(event) => onChangeHyperparameters(index, 'value', event)}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Button onClick={() => onRemoveHyperparameter(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddHyperparameter}>Add hyperparameter</Button>
            </FormSection>
        )
    }

    const renderInputDataConfiguration = () => {
        return (
            <FormSection header='Input data configuration' description='Create up to 20 channels of input sources. If the algorithm you chose supports multiple input channels, you can specify those here.'>
                {
                    inputData.map((channel, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={1} md={1}>
                                <Text> {channel.key} </Text>
                            </Grid>
                            <Grid item xs={2} sm={3} md={3}>
                                <Input type='text' value={channel.value} onChange={(event)=>onChangeInputData(channel.key, event)}/>
                            </Grid>
                        </Grid>
                    ))
                }
            </FormSection>
        )
    }

    const renderCheckpointConfiguration = () => {
        return (
            <FormSection header='Checkpoint configuration - optional' description='The algorithm is responsible for periodically generating checkpoints. The checkpoints are saved to this location and used to resume managed spot training jobs'>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Text variant='p'>S3 location</Text>
                        <div style={{marginTop: '5px'}}/>
                        <Input value={checkpointS3Uri} placeholder='s3://{bucket}/path-to-your-data' required={true} onChange={(event) => onChange('formFieldIdCheckpointS3Uri', event)} />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4} />
                    <Grid item xs={2} sm={4} md={4}>
                        <Text variant='p'>Local path - optional</Text>
                        <Text variant='small'>If you want Amazon SageMaker to encrypt the output of your training job using your own AWS KMS encryption key instead of the default S3 service key, provide its ID or ARN.</Text>
                        <div style={{marginTop: '5px'}}/>
                        <Input value={checkpointLocalPath} onChange={(event) => onChange('formFieldIdCheckpointLocalPath', event)} />
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderOutputDataConfiguration = () => {
            return (
                <FormSection header='Output data configuration'>
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={4} md={4}>
                            <Input value={outputS3Uri} placeholder='s3://{bucket}/path-to-your-data' required={true} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)} />
                        </Grid>
                    </Grid>
                </FormSection>
        )
    }

    const renderManagedSpotTraining = () => {
        return (
            <FormSection header='Managed spot training'>
                <FormField controlId='formFieldIdSpotTrainingEnabled'>
                <Toggle label="Enable managed spot training - optional" description="Save compute costs for jobs that have flexibility in start and end times. Amazon SageMaker will use spare capacity only to run this job." onChange={(event) => onChange('formFieldIdSpotTrainingEnabled', event)} />   
                </FormField>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text variant='p'>Maximum wait time before job terminates optional stopping condition</Text>
                        <Text variant='small'>At the end of this duration you will receive the complete or partial results of you managed spot training job.</Text>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '5px', marginBottom: '5px'}}>
                            <Input value={maxWaitTime} disabled={!enableManagedSpotTraining} required={true} onChange={(event) => onChange('formFieldIdSpotTrainingMaxWaitTime', event)} />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '5px', marginBottom: '5px'}}>
                            <Select
                                placeholder='Choose an option'
                                options={timeUnitOptions}
                                selectedOption={selectedWaitiUnit}
                                onChange={(event) => onChange('formFieldIdSpotTrainingUnit', event)}
                                disabled={!enableManagedSpotTraining}
                            />
                        </div>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTrainingJobTag = () => {
        return (
            <FormSection header='Tags - optional'>
                {
                    tags.length>0 && 
                    <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text> Key </Text>
                        </Grid>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text> Value </Text> 
                        </Grid>
                        <Grid item xs={2} sm={2} md={2}>
                            <Text>  </Text>
                        </Grid>
                    </Grid>
                }
                {
                    tags.map((tag, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={tag.key}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={tag.value}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddTag}>Add tag</Button>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                { renderTrainingJobSetting() }
                { scriptMode && renderHyperparameters() }
                { renderInputDataConfiguration() }
                { !scriptMode && renderCheckpointConfiguration() }
                { !scriptMode && renderOutputDataConfiguration()}
                { !scriptMode && renderManagedSpotTraining() }
                { !scriptMode && renderTrainingJobTag() }
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
                { scriptMode && renderHyperparameters() }
                { renderInputDataConfiguration() }
                { !scriptMode && renderCheckpointConfiguration() }
                { !scriptMode && renderOutputDataConfiguration()}
                { !scriptMode && renderManagedSpotTraining() }
                { !scriptMode && renderTrainingJobTag() }
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateTrainingjobInstanceTypeAction: UpdateTrainingjobInstanceType,
    updateTrainingjobInstanceCountAction: UpdateTrainingjobInstanceCount,
    updateTrainingjobVolumeSizeInGBAction: UpdateTrainingjobVolumeSizeInGB,
    updateTrainingjobHyperparametersAction: UpdateTrainingjobHyperparameters,
    updateTrainingjobInputDataAction: UpdateTrainingjobInputData,
    updateTrainingjobOutputS3UriAction: UpdateTrainingjobOutputS3Uri
};

const mapStateToProps = (state: AppState) => ({
    scriptMode: state.pipeline.scritpMode,
    trainingjobInstanceType : state.pipeline.trainingjobInstanceType,
    trainingjobInstanceCount : state.pipeline.trainingjobInstanceCount,
    trainingjobVolumeSizeInGB : state.pipeline.trainingjobVolumeSizeInGB,
    trainingjobHyperparameters: state.pipeline.trainingjobHyperparameters,
    trainingjobInputData : state.pipeline.trainingjobInputData,
    trainingjobOutputS3Uri : state.pipeline.trainingjobOutputS3Uri,
    industrialModels : state.industrialmodel.industrialModels,
    industrialModel: state.pipeline.industrialModel
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TrainingJobForm);