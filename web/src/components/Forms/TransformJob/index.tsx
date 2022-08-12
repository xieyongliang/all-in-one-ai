import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Input, Button, Select, Text } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { SelectOption } from 'aws-northstar/components/Select';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import Grid from '@mui/material/Grid';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    industrialModels : IIndustrialModel[];
}

const s3DateTypeOptions : SelectOption[] = [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' },
    { label: 'AugmentedManifestFile', value: 'AugmentedManifestFile' }
];

const contentTypeOptions : SelectOption[] = [
    { label: 'image/png', value: 'image/png' },
    { label: 'image/jpg', value: 'image/jpg' },
    { label: 'image/jpeg', value: 'image/jpeg' },
    { label: 'text/plain', value: 'text/plain' },
    { label: 'application/json', value: 'application/json'}
];

const compressionOptions: SelectOption[] = [
    { label: 'None', value: 'None' },
    { label: 'Gzip', value: 'Gzip' }
]

const batchStrategyOptions: SelectOption[] = [
    { label: 'MultiRecord', value: 'MultiRecord' },
    { label: 'SingleRecord', value: 'SingleRecord'}
]

const splitTypeOptions: SelectOption[] = [
    { label: 'None', value: 'None' },
    { label: 'Input', value: 'Input' },
    { label: 'RecordIO', value: 'RecordIO' },
    { label: 'TFRecord', value: 'TFRecord' }
]

const assembleWithOptions: SelectOption[] = [
    { label: 'None', value: 'None' },
    { label: 'Input', value: 'Input' }
]

const joinSourceOptions: SelectOption[] = [
    { label: 'None', value: 'None' },
    { label: 'Line', value: 'Line' }
]

const instanceTypeOptions : SelectOption[] = [
    {
        label: 'Standard', 
        options: [ 
            { label: 'ml.m5.large', value: 'ml.m5.large' }, 
            { label: 'ml.m5.xlarge', value: 'ml.m5.xlarge' }, 
            { label: 'ml.m5.2xlarge', value: 'ml.m5.2xlarge' }, 
            { label: 'ml.m5.4xlarge', value: 'ml.m5.4xlarge' }, 
            { label: 'ml.m5.12large', value: 'ml.m5.12xlarge' }, 
            { label: 'ml.m5.24xlarge', value: 'ml.m5.24xlarge' },
            { label: 'ml.m4.xlarge', value: 'ml.m4.xlarge'},    
            { label: 'ml.m4.2xlarge', value: 'ml.m4.2xlarge'},    
            { label: 'ml.m4.4xlarge', value: 'ml.m4.4xlarge'},    
            { label: 'ml.m4.10xlarge', value: 'ml.m4.10xlarge'},    
            { label: 'ml.m4.16xlarge', value: 'ml.m4.16xlarge'}
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
            { label: 'ml.c4.xlarge', value: 'ml.c4.xlarge' },
            { label: 'ml.c4.2xlarge', value: 'ml.c4.2xlarge' },
            { label: 'ml.c4.4xlarge', value: 'ml.c4.4xlarge' },
            { label: 'ml.c4.8xlarge', value: 'ml.c4.8xlarge' }
        ]
    },
    {
        label: 'Accelerated computing', 
        options: [ 
            { label: 'ml.p2.xlarge', value: 'ml.p2.xlarge' },
            { label: 'ml.p2.8xlarge', value: 'ml.p2.8xlarge' },
            { label: 'ml.p2.16xlarge', value: 'ml.p2.16xlarge' },
            { label: 'ml.p3.xlarge', value: 'ml.p3.xlarge' },
            { label: 'ml.p3.8xlarge', value: 'ml.p3.8xlarge' },
            { label: 'ml.p3.16xlarge', value: 'ml.p3.16xlarge' }
        ]
    }
];

const TransformJobForm: FunctionComponent<IProps> = (props) => {
    const [ modelOptions, setModelOptions ] = useState([]);
    const [ selectedS3DataType, setSelectedS3DataType ] = useState<SelectOption>({ label: 'S3Prefix', value: 'S3Prefix' });
    const [ selectedContentType, setSelectedContentType ] = useState<SelectOption>({ label: 'image/png', value: 'image/png' });
    const [ selectedCompressionType, setSelectedCompressionType ] = useState<SelectOption>({ label: 'None', value: 'None' })
    const [ selectedBatchStrategy, setSelectedBatchStrategy ] = useState<SelectOption>({ label: 'SingleRecord', value: 'SingleRecord' })
    const [ selectedSplitType, setSelectedSplitType ] = useState<SelectOption>({ label: 'None', value: 'None' })
    const [ selectedAssembleWith, setSelectedAssembleWith ] = useState<SelectOption>({ label: 'None', value: 'None' })    
    const [ selectedJoinSource, setSelectedJoinSource ] = useState<SelectOption>({ label: 'None', value: 'None' })    
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>({});
    const [ selectedModelName, setSelectedModelName ] = useState<SelectOption>({});
    const [ transformJobName, setTransformJobName ] = useState('');
    const [ invocationsTimeoutInSeconds, setInvocationsTimeoutInSeconds ] = useState(600);
    const [ invocationsMaxRetries, setInvocationsMaxRetries ] = useState(3);
    const [ maxPayloadInMB, setMaxPayloadInMB ] = useState(6);    
    const [ instanceCount, setInstanceCount ] = useState(1);
    const [ maxConcurrentTransforms, setMaxConcurrentTransforms ] = useState(1);
    const [ inputS3Uri, setInputS3Uri ] = useState('');
    const [ outputS3Uri, setOutputS3Uri ] = useState('');
    const [ inputFilter, setInputFilter ] = useState('');
    const [ outputFilter, setOutputFilter ] = useState('');
    const [ accept, setAccept ] = useState('')
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ environments, setEnvironments ] = useState([])
    const [ processing, setProcessing ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    useEffect(() => {
        axios.get('/model', {params: {industrial_model: params.id}})
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.ModellName, value: item.ModelName})
            }
            setModelOptions(items);
        }, (error) => {
            console.log(error);
        });
    }, [params.id])

    const onChange = ((id: string, event: any) => {
        if(id === 'formFieldIdTransformJobName') {
            setTransformJobName(event);
        }
        if(id === 'formFieldIdModelName') {
            setSelectedModelName({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdS3DataType') {
            setSelectedS3DataType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdContentType') {
            setSelectedContentType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdCompressionType') {
            setSelectedCompressionType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdBatchStrategy') {
            setSelectedBatchStrategy({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdSplitType') {
            setSelectedSplitType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdAssembleWith') {
            setSelectedAssembleWith({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdJoinSource') {
            setSelectedJoinSource({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(event);
        }
        if(id === 'formFieldIdInvocationsTimeoutInSeconds') {
            setInvocationsTimeoutInSeconds(event);
        }        
        if(id === 'formFieldIdInvocationsMaxRetries') {
            setInvocationsMaxRetries(event);
        }        
        if(id === 'formFieldIdMaxConcurrentTransform') {
            setMaxConcurrentTransforms(event);
        }        
        if(id === 'formFieldIdMaxPayloadInMB') {
            setMaxPayloadInMB(event);
        }        
        if(id === 'formFieldIdInputS3Uri') {
            setInputS3Uri(event);
        }        
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
        }
        if(id === 'formFieldIdInputFilter') {
            setInputFilter(event);
        }        
        if(id === 'formFieldIdOutputFilter') {
            setOutputFilter(event);
        }
        if(id === 'formFieldIdAccept') {
            setAccept(event);
        }       
    })

    const onSubmit = () => {
        var body = {
            'transform_job_name' : transformJobName,
            'model_name': selectedModelName.value,
            'max_concurrent_transforms': maxConcurrentTransforms,
            'invocations_timeout_in_seconds': invocationsTimeoutInSeconds,
            'invocations_max_retries': invocationsMaxRetries,
            'max_payload_in_mb': maxPayloadInMB,
            'batch_strategy': selectedBatchStrategy.value,
            's3_data_type': selectedS3DataType.value,
            'input_s3uri': inputS3Uri,
            'content_type': selectedContentType.value,
            'compression_type': selectedCompressionType.value,
            'split_type': selectedSplitType.value,
            'output_s3uri': outputS3Uri,
            'accept': accept,
            'assemble_with': selectedAssembleWith.value,
            'instance_type': selectedInstanceType.value,
            'instance_count': instanceCount,
            'input_filter': inputFilter,
            'output_filter': outputFilter,
            'join_source': selectedJoinSource.value,
            'tags': tags,
            'industrial_model': params.id
        }

        if(environments.length > 0) {
            var environment = {}
            environments.forEach((item) => {
                environment[item['key']] = item['value'];
            })
            body['environment'] = JSON.stringify(environment)
        }

        setProcessing(true)
        axios.post('/transformjob', body) 
            .then((response) => {
                history.goBack()
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
                setProcessing(false);
            });
    }

    const onCancel = () => {
        history.goBack()
    }
    
    const renderTransformJobConfiguration = () => {
        return (
            <FormSection header='Job configuration'>
                <FormField label='Job name' controlId={uuidv4()}>
                    <Input value = {transformJobName} required={true} onChange={(event) => onChange('formFieldIdTransformJobName', event)}> </Input>
                </FormField>
                <FormField label='Model name' controlId={uuidv4()}>
                    <Select
                        placeholder='Choose an option'
                        options={modelOptions}
                        selectedOption={selectedModelName}
                        onChange={(event) => onChange('formFieldIdModelName', event)}
                    />
                </FormField>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Text>Instance type</Text>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>Instance count</Text>
                    </Grid>
                    <Grid item xs={2} sm={4} md={4}>
                        <div style={{marginTop: '-20px', marginBottom: '20px', width: '515px'}}>
                            <Select
                                placeholder='Choose an option'
                                options={instanceTypeOptions}
                                selectedOption={selectedInstanceType}
                                onChange={(event) => onChange('formFieldIdInstanceType', event)}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <div style={{marginTop: '-20px', marginBottom: '20px', width: '250px'}}>
                            <Input value = {instanceCount} type={'number'} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)}> </Input>
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <div style={{marginTop: '-20px'}}>
                            <FormField label='Max concurrent transforms - optional' controlId={uuidv4()} description='Maximum number of parallel requests that can be launched on a single instance.'>
                                <div style={{width: '382px'}}>
                                    <Input value = {maxConcurrentTransforms} type={'number'} required={true} onChange={(event) => onChange('max_concurrent_transforms', event)}/>
                                </div>
                            </FormField>
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <div style={{marginTop: '-20px'}}>
                            <FormField label='Max payload size (MB) - optional' controlId={uuidv4()} description='Maximum size allowed for a mini-batch. Must be greater than a single record.'>
                                <div style={{width: '382px'}}>
                                    <Input value = {maxPayloadInMB} type={'number'} required={true} onChange={(event) => onChange('formFieldIdMaxPayloadInMB', event)}/>
                                </div>
                            </FormField>
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Batch strategy - optional' controlId={uuidv4()} description='Maximum number of records per mini-batch.'>
                            <div style={{width: '382px'}}>
                                <Select
                                    placeholder='Choose an option'
                                    options={batchStrategyOptions}
                                    selectedOption={selectedBatchStrategy}
                                    onChange={(event) => onChange('formFieldIdBatchStrategy', event)}
                                />
                            </div>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <FormField label='Max invocation retries - optional' controlId={uuidv4()} description='The maximum number of retries when invocation requests are failing. Minimum value of 0. Maximum value of 3.'>
                            <div style={{width: '382px'}}>
                                <Input value = {invocationsTimeoutInSeconds} type={'number'} required={true} onChange={(event) => onChange('formFieldIdInvocationsMaxRetries', event)}/>
                            </div>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <FormField label='Invocation timeout in seconds - optional' controlId={uuidv4()} description='The timeout value in seconds for an invocation request. Minimum value of 1. Maximum value of 3600.'>
                            <div style={{width: '382px'}}>
                                <Input value = {invocationsMaxRetries} type={'number'} required={true} onChange={(event) => onChange('formFieldIdInvocationsTimeoutInSeconds', event)}/>
                            </div>
                        </FormField>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobInputDataConfiguration = () => {
        return (
            <FormSection header='Input data configuration'>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={4} md={4}>
                        <Text>S3 data type</Text>
                    </Grid>
                    <Grid item xs={2} sm={2} md={2}>
                        <Text>Split type</Text>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <div style={{marginTop: '-20px', marginBottom: '20px', width: '382px'}}>
                            <Select
                                placeholder='Choose an option'
                                options={s3DateTypeOptions}
                                selectedOption={selectedS3DataType}
                                onChange={(event) => onChange('formFieldIdS3DataType', event)}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={3} md={3}>
                        <div style={{marginTop: '-20px', marginBottom: '20px', width: '382px'}}>
                            <Select
                                placeholder='Choose an option'
                                options={splitTypeOptions}
                                selectedOption={selectedSplitType}
                                onChange={(event) => onChange('formFieldIdSplitType', event)}
                            />
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <div style={{marginTop: '-20px'}}>
                            <FormField label='Compression' controlId={uuidv4()}>
                                <div style={{width: '780px'}}>
                                    <Select
                                        placeholder='Choose an option'
                                        options={compressionOptions}
                                        selectedOption={selectedCompressionType}
                                        onChange={(event) => onChange('formFieldIdCompressionType', event)}
                                    />
                                </div>
                            </FormField>
                        </div>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='S3 location' controlId={uuidv4()}>
                            <Input type='text' value={inputS3Uri} placeholder='S3Uri' required={true} onChange={(event) => onChange('formFieldIdInputS3Uri', event)}/>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Content type - optional' controlId={uuidv4()}>
                            <div style={{width: '780px'}}>
                                <Select
                                    placeholder='Choose an option'
                                    options={contentTypeOptions}
                                    selectedOption={selectedContentType}
                                    onChange={(event) => onChange('formFieldIdContentType', event)}
                                />
                            </div>
                        </FormField>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobOutputDataConfiguration = () => {
        return (
            <FormSection header='Output data configuration'>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='S3 output path' controlId={uuidv4()}>
                            <Input type='text' value={outputS3Uri} placeholder='S3Uri' required={true} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)}/>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Assemble with' controlId={uuidv4()}>
                            <div style={{width: '780px'}}>
                                <Select
                                    placeholder='Choose an option'
                                    options={assembleWithOptions}
                                    selectedOption={selectedAssembleWith}
                                    onChange={(event) => onChange('formFieldIdAssembleWith', event)}
                                />
                            </div>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Accept - optional' controlId={uuidv4()}>
                            <Input type='text' value={accept} required={true} onChange={(event) => onChange('formFieldIdAccept', event)}/>
                        </FormField>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const renderTransformJobFilterAndDataJoins = () => {
        return (
            <FormSection header='Input/output filtering and data joins - optional'>
                <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Input filter' controlId={uuidv4()} description='Filter input data prior to transform. Leave blank if you want to use all of the input source data.'>
                            <Input type='text' value={inputFilter} required={true} onChange={(event) => onChange('formFieldIdInputFilter', event)}/>
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Join source' controlId={uuidv4()} description='Choose the source of data to join with your output. Use Output filter to specify the final output.'>
                            <Select
                                placeholder='Choose an option'
                                options={joinSourceOptions}
                                selectedOption={selectedJoinSource}
                                onChange={(event) => onChange('formFieldIdJoinSource', event)}
                            />
                        </FormField>
                    </Grid>
                    <Grid item xs={2} sm={8} md={8}>
                        <FormField label='Output filter' controlId={uuidv4()} description='Filter output data after input/output join, if used. Leave blank if you want to use all of the output.'>
                            <Input type='text' value={outputFilter} required={true} onChange={(event) => onChange('formFieldIdOutputFilter', event)}/>
                        </FormField>
                    </Grid>
                </Grid>
            </FormSection>
        )
    }

    const onAddEnvironment = () => {
        var copyEnvironments = JSON.parse(JSON.stringify(environments))
        copyEnvironments.push({key:'', value:''});
        setEnvironments(copyEnvironments);
    }

    const onRemoveEnvironment = (index) => {
        var copyEnvironments = JSON.parse(JSON.stringify(environments))
        copyEnvironments.splice(index, 1);
        setEnvironments(copyEnvironments);
    }

    const renderTransformJobEnvironment = () => {
        return (
            <FormSection header='Environments - optional'>
                {
                    environments.length>0 && 
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
                    environments.map((environment, index) => (
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 8 }}>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={environment.key}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Input type='text' value={environment.value}/>
                            </Grid>
                            <Grid item xs={2} sm={2} md={2}>
                                <Button onClick={() => onRemoveEnvironment(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddEnvironment}>Add environment</Button>
            </FormSection>
        )
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

    const renderTransformJobTag = () => {
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

    return (
        <Form
            header='Create batch transform job'
            description='A transform job uses a model to transform data and stores the results at a specified location.'
            actions={
                <div>
                    <Button variant='link' onClick={onCancel}>Cancel</Button>
                    <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                </div>
            }>
            { renderTransformJobConfiguration() }
            { renderTransformJobEnvironment() }
            { renderTransformJobInputDataConfiguration() }
            { renderTransformJobOutputDataConfiguration() }
            { renderTransformJobFilterAndDataJoins() }
            { renderTransformJobEnvironment() }
            { renderTransformJobTag() }
        </Form>
    );
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
)(TransformJobForm);