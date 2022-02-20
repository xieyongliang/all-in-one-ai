import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Inline, Stack, Text } from 'aws-northstar';
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
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m4.xlarge', value: 'ml.m4.xlarge' }, 
            { label: 'ml.m4.2xlarge', value: 'ml.m4.2xlarge' }, 
            { label: 'ml.m4.4xlarge', value: 'ml.m4.4xlarge' }, 
            { label: 'ml.m4.10large', value: 'ml.m4.10large' }, 
            { label: 'ml.m4.16xlarge', value: 'ml.m4.16xlarge' }, 
        ]
    },
    {
        label: 'Compute optimized', 
        options: [ 
            { label: 'ml.c5.xlarge', value: 'ml.c5.xlarge' },
            { label: 'ml.c5.2xlarge', value: 'ml.c5.2xlarge' },
            { label: 'ml.c5.4xlarge', value: 'ml.c5.4xlarge' },
            { label: 'ml.c5.9xlarge', value: 'ml.c5.9xlarge' },
            { label: 'ml.c5.18xlarge', value: 'ml.c5.18xlarge' },
            { label: 'ml.c4.1xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' },
            { label: 'ml.c5n.xlarge', value: 'ml.c5n.xlarge' },
            { label: 'ml.c5n.2xlarge', value: 'ml.c5n.2xlarge' },
            { label: 'ml.c5n.4xlarge', value: 'ml.c5n.4xlarge' },
            { label: 'ml.c5n.9xlarge', value: 'ml.c5n.9xlarge' },
            { label: 'ml.c5n.18xlarge', value: 'ml.c5n.18xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
            { label: 'ml.p3.2xlarge', value: 'ml.p3.2xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' },
            { label: 'ml.p3dn.24xlarge', value: 'ml.p3dn.24xlarge' },
            { label: 'ml.p4dn.xlarge', value: 'ml.p4dn.xlarge' },
            { label: 'ml.p4dn.2xlarge', value: 'ml.p4dn.2xlarge' },
            { label: 'ml.p4dn.4xlarge', value: 'ml.p4dn.4xlarge' },
            { label: 'ml.p4dn.8xlarge', value: 'ml.p4dn.8xlarge' },
            { label: 'ml.p4dn.12xlarge', value: 'ml.p4dn.12xlarge' },
            { label: 'ml.p4dn.16xlarge', value: 'ml.p4dn.16xlarge' },
            { label: 'ml.p4d.24xlarge', value: 'ml.p4d.24xlarge' },
            { label: 'ml.g5.xlarge', value: 'ml.g5.xlarge' },
            { label: 'ml.g5.2xlarge', value: 'ml.g5.2xlarge' },
            { label: 'ml.g5.4xlarge', value: 'ml.g5.4xlarge' },
            { label: 'ml.g5.8xlarge', value: 'ml.g5.8xlarge' },
            { label: 'ml.g5.12xlarge', value: 'ml.g5.12xlarge' },
            { label: 'ml.g5.16xlarge', value: 'ml.g5.16xlarge' },
            { label: 'ml.g5.24xlarge', value: 'ml.g5.24xlarge' },
            { label: 'ml.g5.48xlarge', value: 'ml.g5.48xlarge' }
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
    const [ inputS3Uri, setInputS3Uri ] = useState('')
    const [ imagesPrefix, setImagesPrefix ] = useState('images')
    const [ labelsPrefix, setLabelsPrefix ] = useState('labels')
    const [ weightsPrefix, setWeightsPrefix ] = useState('weights')
    const [ cfgPrefix, setCfgPrefix ] = useState('cfg')
    const [ outputS3Uri, setOutputS3Uri ] = useState('')
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidTrainingJobName, setInvalidTrainingJobName ] = useState(false)
    const [ invalidInstanceType, setinvalidInstanceType ] = useState(false)
    const [ invalidInstanceCount, setInvalidInstanceCount ] = useState(false)
    const [ invalidVolumeSizeInGB, setInvalidVolumeSizeInGB ] = useState(false)
    const [ invalidInputS3Uri, setInvalidInputS3Uri ] = useState(false)
    const [ invalidImagesPrefix, setInvalidImagesPrefix ] = useState(false)
    const [ invalidLabelsPrefix, setInvalidLabelsPrefix ] = useState(false)
    const [ invalidWeightsPrefix, setInvalidWeightsPrefix ] = useState(false)
    const [ invalidCfgPrefix, setInvalidCfgPrefix ] = useState(false)
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
        if(id === 'formFieldIdInputS3Uri')
            setInputS3Uri(event);
        if(id === 'formFieldIdImagesPrefix')
            setImagesPrefix(event);
        if(id === 'formFieldIdLabelsPrefix')
            setLabelsPrefix(event);
        if(id === 'formFieldIdWeightsPrefix')
            setWeightsPrefix(event);
        if(id === 'formFieldIdCfgPrefix')
            setCfgPrefix(event);
        if(id === 'formFieldIdOutputS3Uri')
            setOutputS3Uri(event);
    }

    const onSubmit = () => {
        if(trainingJobName === '')
            setInvalidTrainingJobName(true)
        else if(selectedInstanceType.value === undefined)
            setinvalidInstanceType(true)
        else if(instanceCount < 0)
            setInvalidInstanceCount(true)
        else if(volumeSizeInGB < 0)
            setInvalidVolumeSizeInGB(true)
        else if(inputS3Uri === '')
            setInvalidInputS3Uri(true)
        else if(imagesPrefix === '')
            setInvalidImagesPrefix(true)
        else if(labelsPrefix === '')
            setInvalidLabelsPrefix(true)
        else if(weightsPrefix === '')
            setInvalidWeightsPrefix(true)
        else if(cfgPrefix === '')
            setInvalidCfgPrefix(true)
        else if(outputS3Uri === '')
            setInvalidOutputS3Uri(true)
        else {
            var body = {
                'trainingjob_name' : trainingJobName,
                'case_name': params.name,
                'instance_type': selectedInstanceType.value,
                'instance_count': instanceCount,
                'volume_size_in_gb': volumeSizeInGB,
                'input_s3uri': inputS3Uri,
                'images_prefix': imagesPrefix,
                'labels_prefix': labelsPrefix,
                'weights_prefix': weightsPrefix,
                'cfg_prefix': cfgPrefix,
                'output_s3uri': outputS3Uri
            }
            if(tags.length > 1 || (tags.length == 1 && tags[0].key != '' && tags[0].value != ''))
                body['tags'] = tags
            axios.post('/trainingjob', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=demo#trainingjob`)
            }, (error) => {
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
                    <FormField label="S3 location" controlId="formFieldIdInputS3Uri">
                        <Input value={inputS3Uri} placeholder='s3://' required={true} invalid={invalidInputS3Uri} onChange={(event) => onChange('formFieldIdInputS3Uri', event)}/>
                    </FormField>
                    <FormField label="Images prefix" controlId="formFieldIdImagesPrefix">
                        <Input value={imagesPrefix} required={true} invalid={invalidImagesPrefix} onChange={(event) => onChange('formFieldIdImagesPrefix', event)}/>
                    </FormField>
                    <FormField label="Lables prefix" controlId="formFieldIdLabelsPrefix">
                        <Input value={labelsPrefix} required={true} invalid={invalidLabelsPrefix} onChange={(event) => onChange('formFieldIdLabelsPrefix', event)} />
                    </FormField>
                    <FormField label="Weights prefix" controlId="formFieldIdWeightsPrefix">
                        <Input value={weightsPrefix} required={true} invalid={invalidWeightsPrefix} onChange={(event) => onChange('formFieldIdWeightsPrefix', event)} />
                    </FormField>
                    <FormField label="Cfg prefix" controlId="formFieldIdCfgPrefix">
                        <Input value={cfgPrefix} required={true} invalid={invalidCfgPrefix} onChange={(event) => onChange('formFieldIdCfgPrefix', event)} />
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