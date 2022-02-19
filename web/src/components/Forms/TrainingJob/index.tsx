import { FunctionComponent, useState } from 'react';
import { Form, FormSection, FormField, Input, Button, Inline, Stack, Text } from 'aws-northstar';
import { useHistory, useParams } from 'react-router-dom'; 
import Select, { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';

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
    const [ trainingImage, setTrainingImage ] = useState('')
    const [ selectedInstanceType, setSelectedInstanceType ] = useState({})
    const [ selectedInstanceCount, setSelectedInstanceCount ] = useState(1)
    const [ volumeSizeInGb, setVolumeSizeInGb ] = useState(30)
    const [ inputS3Uri, setInputS3Uri ] = useState('')
    const [ imagesPrefix, setImagesPrefix ] = useState('')
    const [ labelsPrefix, setLabelsPrefix ] = useState('')
    const [ weightsPrefix, setWeightsPrefix ] = useState('')
    const [ cfgPrefix, setCfgPrefix ] = useState('')

    const history = useHistory();

    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdTrainingJobName') {
            setTrainingJobName(event);
        }
        if(id === 'formFieldIdTrainingImage') {
            setTrainingImage(event);
        }
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldId') {
            
        }
        if(id === 'formFieldIdInstanceType') {
        }
        if(id === 'formFieldIdInstanceCount') {
        }
        if(id === 'formFieldIdMaxConcurrentTransform') {
        }        
        if(id === 'formFieldIdS3InputUri') {
        }        
        if(id === 'formFieldIdS3OutputUri') {
        }        
    }

    const onSubmit = () => {
        history.push(`/case/${params.name}?tab=trainingjob`)
    }

    const onCancel = () => {
        history.push(`/case/${params.name}?tab=trainingjob`)
    }

    const onRemove = () => {
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
                        <Input type="text" />
                    </FormField>
                    <FormField label="Container ECR path" controlId="formFieldIdTrainingImage" hintText='The registry path where the training image is stored in Amazon ECRThe registry path where the training image is stored in Amazon ECR'>
                        <Input type="text" controlId="formFieldIdTrainingImage" />
                    </FormField>
                </FormSection>
            )
        }
        else{
            return (
                <FormSection header="Job settings">
                    <FormField label="Container ECR path" controlId="formFieldIdTrainingImage" hintText='The registry path where the training image is stored in Amazon ECR'>
                        <Input type="text" />
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderTrainingJobTag = () => {
        if(wizard) {
            return (
                <FormSection header="Tags - optional">
                    <Inline>
                        <FormField label="Key" controlId="formFieldIdTagKey">
                            <Input type="text" />
                        </FormField>
                        <FormField label="Value" controlId="formFieldIdTagValue">
                            <Inline>
                                <Input type="text" />
                            </Inline>
                        </FormField>
                        <FormField label="Operation" controlId="formFieldIdOperation">
                            <Inline>
                                <Button onClick={onRemove}>Remove</Button>
                            </Inline>
                        </FormField>
                    </Inline>
                    <Button variant="link">Add tag</Button>
                </FormSection>
            )
        }
        else
            return (
                <FormSection header="Job configuration">
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
                    <Grid item xs={2} sm={4} md={4}>
                        <Input type="text" />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Input type="text" />
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <Button onClick={onRemove}>Remove</Button>
                    </Grid>
                </Grid>
                <Button variant="link" size="large">Add tag</Button>
            </FormSection>
            )
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
                            onChange={(event) => onChange('formFieldIdInstanceType', event)}
                        />
                    </FormField>
                    <FormField label="Instance count" controlId="formFieldIdInstanceCount">
                        <Input type="text" value='1' onChange={(event) => onChange('formFieldIdInstanceCount', event)} />
                    </FormField>
                    <FormField label="Additional storage volume per instance (GB)" controlId="formFieldIdVolumeSizeInGB">
                        <Input type="text" value='30' onChange={(event) => onChange('formFieldIdVolumeSizeInGB', event)}/>
                    </FormField>
                </FormSection>
                <FormSection header="Input data configuration">
                    <FormField label="S3 location" controlId="formFieldIdInputS3Uri">
                        <Input type="text" placeholder='s3://' onChange={(event) => onChange('formFieldIdInputS3Uri', event)}/>
                    </FormField>
                    <FormField label="Images prefix" controlId="formFieldIdImagesPrefix">
                        <Input type="text" value='images' onChange={(event) => onChange('formFieldIdImagesPrefix', event)}/>
                    </FormField>
                    <FormField label="Lables prefix" controlId="formFieldIdLabelsPrefix">
                        <Input type="text" value='labels' onChange={(event) => onChange('formFieldIdLabelsPrefix', event)} />
                    </FormField>
                    <FormField label="Weights prefix" controlId="formFieldIdWeightsPrefix">
                        <Input type="text" value='weights' onChange={(event) => onChange('formFieldIdWeightsPrefix', event)} />
                    </FormField>
                    <FormField label="Cfg prefix" controlId="formFieldIdCfgPrefix">
                        <Input type="text" value='cfg' onChange={(event) => onChange('formFieldIdCfgPrefix', event)} />
                    </FormField>
                </FormSection>
                <FormSection header="Output data configuration">
                    <FormField label="S3 output path" controlId="formFieldIdOutputS3Uri">
                        <Input type="text" placeholder='s3://' onChange={(event) => onChange('formFieldIdOutputS3Uri', event)} />
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