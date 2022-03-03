import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Stack, Text } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';

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

interface PathParams {
    name: string;
}

interface TrainingJobFormProps {
    wizard?: boolean;
}

const TrainingJobForm: FunctionComponent<TrainingJobFormProps> = (props) => {
    const [ trainingJobName, setTrainingJobName ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>({})
    const [ instanceCount, setInstanceCount ] = useState(1)
    const [ volumeSizeInGB, setVolumeSizeInGB ] = useState(30)
    const [ imagesS3Uri, setImagesS3Uri ] = useState('')
    const [ labelsS3Uri, setLabelsS3Uri ] = useState('')
    const [ weightsS3Uri, setWeightsS3Uri ] = useState('')
    const [ cfgS3Uri, setCfgS3Uri ] = useState('')
    const [ outputS3Uri, setOutputS3Uri ] = useState('')
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidTrainingJobName, setInvalidTrainingJobName ] = useState(false)
    const [ invalidInstanceType, setinvalidInstanceType ] = useState(false)
    const [ invalidInstanceCount, setInvalidInstanceCount ] = useState(false)
    const [ invalidVolumeSizeInGB, setInvalidVolumeSizeInGB ] = useState(false)
    const [ invalidImagesS3Uri, setInvalidImagesS3Uri ] = useState(false)
    const [ invalidLabelsS3Uri, setInvalidLabelsS3Uri ] = useState(false)
    const [ invalidOutputS3Uri, setInvalidOutputS3Uri ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdTrainingJobName')
            setTrainingJobName(event);
        if(id === 'formFieldIdInstanceType')
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        if(id === 'formFieldIdInstanceCount')
            setInstanceCount(parseInt(event));
        if(id === 'formFieldIdVolumeSizeInGB')
            setVolumeSizeInGB(parseInt(event));
        if(id === 'formFieldIdImagesS3Uri')
            setImagesS3Uri(event);
        if(id === 'formFieldIdLabelsS3Uri')
            setLabelsS3Uri(event);
        if(id === 'formFieldIdWeightsS3Uri')
            setWeightsS3Uri(event);
        if(id === 'formFieldIdCfgS3Uri')
            setCfgS3Uri(event);
        if(id === 'formFieldIdOutputS3Uri')
            setOutputS3Uri(event);
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
            var body = {
                'training_job_name' : trainingJobName,
                'case_name': params.name,
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
            axios.post('/trainingjob', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=trainingjob`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });    
        }
    }

    const onCancel = () => {
        history.push(`/case/${params.name}?tab=trainingjob`)
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
                <FormSection header="Job settings">
                    <FormField label="Job name" controlId="formFieldIdJobName" hintText='Maximum of 63 alphanumeric characters. Can include hyphens (-), but not spaces. Must be unique within your account in an AWS Region.'>
                        <Input type="text" invalid={invalidTrainingJobName} required={true} onChange={(event) => onChange('formFieldIdTrainingJobName', event)}/>
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderTrainingJobTag = () => {
        if(!wizard)
            return (
                <FormSection header="Tags - optional">
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
                                    <Input type="text" value={tag.key}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Input type="text" value={tag.value}/>
                                </Grid>
                                <Grid item xs={2} sm={4} md={4}>
                                    <Button onClick={() => onRemoveTag(index)}>Remove</Button>
                                </Grid>
                            </Grid>
                        ))
                    }
                    <Button variant="link" size="large" onClick={onAddTag}>Add tag</Button>
                </FormSection>
            )
        else
            return ''
    }

    const renderTrainingJobContent = () => {
        return (
            <Stack>
                <FormSection header="Resource configuration">
                    <FormField label="Instance type" controlId="formFieldIdInstanceType">
                    <Select
                            placeholder="Choose an option"
                            options={optionsInstance}
                            selectedOption={selectedInstanceType}
                            invalid={invalidInstanceType}
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                    </FormField>
                    <FormField label="Instance count" controlId="formFieldIdInstanceCount">
                        <Input type="number" value={instanceCount} required={true} invalid={invalidInstanceCount} onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                    </FormField>
                    <FormField label="Additional storage volume per instance (GB)" controlId="formFieldIdVolumeSizeInGB">
                        <Input type="number" value={volumeSizeInGB} required={true} invalid={invalidVolumeSizeInGB} onChange={(event) => onChange('formFieldIdVolumeSizeInGB', event)}/>
                    </FormField>
                </FormSection>
                <FormSection header="Input data configuration">
                    <FormField label="Images S3Uri" controlId="formFieldIdImagesS3Uri">
                        <Input value={imagesS3Uri} required={true} invalid={invalidImagesS3Uri} onChange={(event) => onChange('formFieldIdImagesS3Uri', event)}/>
                    </FormField>
                    <FormField label="Lables S3Uri" controlId="formFieldIdLabelsPrefix">
                        <Input value={labelsS3Uri} required={true} invalid={invalidLabelsS3Uri} onChange={(event) => onChange('formFieldIdLabelsS3Uri', event)} />
                    </FormField>
                    <FormField label="Weights S3Uri" controlId="formFieldIdWeightsS3Uri">
                        <Input value={weightsS3Uri} required={true} placeholder={'default'} onChange={(event) => onChange('formFieldIdWeightsS3Uri', event)}/>
                    </FormField>
                    <FormField label="Cfg S3Uri" controlId="formFieldIdCfgPrefix">
                        <Input value={cfgS3Uri} required={true} placeholder={'default'} onChange={(event) => onChange('formFieldIdCfgPrefix', event)} />
                    </FormField>
                </FormSection>
                <FormSection header="Output data configuration">
                    <FormField label="S3 output path" controlId="formFieldIdOutputS3Uri">
                        <Input value={outputS3Uri} placeholder='s3://' required={true} invalid={invalidOutputS3Uri} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)} />
                    </FormField>
                </FormSection>
            </Stack>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderTrainingJobSetting()}
                {renderTrainingJobContent()}
                {renderTrainingJobTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header="Create training job"
                description="When you create a training job, Amazon SageMaker sets up the distributed compute cluster, performs the training, and deletes the cluster when training has completed. The resulting model artifacts are stored in the location you specified when you created the training job."
                actions={
                    <div>
                        <Button variant="link" onClick={onCancel}>Cancel</Button>
                        <Button variant="primary" onClick={onSubmit}>Submit</Button>
                    </div>
                }>            
                {renderTrainingJobSetting()}
                {renderTrainingJobContent()}
                {renderTrainingJobTag()}
            </Form>
        )
    }
}

export default TrainingJobForm;