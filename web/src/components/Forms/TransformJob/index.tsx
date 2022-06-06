import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Input, Button, Select } from 'aws-northstar';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { SelectOption } from 'aws-northstar/components/Select';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';

interface IProps {
    industrialModels : IIndustrialModel[];
}

const s3DateTypeOptions : SelectOption[]= [
    { label: 'S3Prefix', value: 'S3Prefix' },
    { label: 'ManifestFile', value: 'ManifestFile' }
];

const contentTypeOptions : SelectOption[]= [
    { label: 'image/png', value: 'image/png' },
    { label: 'image/jpg', value: 'image/jpg' },
    { label: 'image/jpeg', value: 'image/jpeg' }
];

const instanceTypeOptions : SelectOption[]= [
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
    const [ optionsModel, setOptionsModel ] = useState([]);
    const [ selectedS3DataType, setSelectedS3DataType ] = useState<SelectOption>({ label: 'S3Prefix', value: 'S3Prefix' });
    const [ selectedContentType, setSelectedContentType ] = useState<SelectOption>({ label: 'image/png', value: 'image/png' });
    const [ selectedInstanceType, setSelectedInstanceType ] = useState<SelectOption>({});
    const [ selectedModelName, setSelectedModelName ] = useState<SelectOption>({});
    const [ transformJobName, setTransformJobName ] = useState('');
    const [ instanceCount, setInstanceCount ] = useState(1);
    const [ maxConcurrentTransforms, setMaxConcurrentTransforms ] = useState(1);
    const [ inputS3Uri, setInputS3Uri ] = useState('');
    const [ outputS3Uri, setOutputS3Uri ] = useState('');
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
            setOptionsModel(items);
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
        if(id === 'formFieldIdInstanceType') {
            setSelectedInstanceType({ label: event.target.value, value: event.target.value });
        }
        if(id === 'formFieldIdInstanceCount') {
            setInstanceCount(event);
        }
        if(id === 'formFieldIdMaxConcurrentTransform') {
            setMaxConcurrentTransforms(event);
        }        
        if(id === 'formFieldIdInputS3Uri') {
            setInputS3Uri(event);
        }        
        if(id === 'formFieldIdOutputS3Uri') {
            setOutputS3Uri(event);
        }        
    })

    const onSubmit = () => {
        var body = {
            'transform_job_name' : transformJobName,
            'model_name': selectedModelName.value,
            's3_data_type': selectedS3DataType.value,
            'content_type': selectedContentType.value,
            'instance_type': selectedInstanceType.value,
            'instance_count': instanceCount,
            'max_concurrent_transforms': maxConcurrentTransforms,
            'input_s3uri': inputS3Uri,
            'output_s3uri': outputS3Uri,
            'industrial_model': params.id
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
            <FormSection header='Job configuration'>
                <FormField label='Job name' controlId='formFieldIdJobName'>
                    <Input value = {transformJobName} required={true} onChange={(event) => onChange('formFieldIdTransformJobName', event)}> </Input>
                </FormField>
                <FormField label='Model name' controlId='formFieldIdModelName'>
                    <Select
                        placeholder='Choose an option'
                        options={optionsModel}
                        selectedOption={selectedModelName}
                        onChange={(event) => onChange('formFieldIdModelName', event)}
                    />
                </FormField>
                <FormField label='Instance Type' controlId='formFieldIdInstanceType'>
                    <Select
                        placeholder='Choose an option'
                        options={instanceTypeOptions}
                        selectedOption={selectedInstanceType}
                        onChange={(event) => onChange('formFieldIdInstanceType', event)}
                    />
                </FormField>
                <FormField label='Instance count' controlId='formFieldIdInstanceCount'>
                    <Input value = {instanceCount} type={'number'} required={true} onChange={(event) => onChange('formFieldIdInstanceCount', event)}> </Input>
                </FormField>
                <FormField label='Max concurrent transforms' controlId='formFieldId3'>
                    <Input value = {maxConcurrentTransforms} type={'number'} required={true} onChange={(event) => onChange('formFieldIdS3Input', event)}/>
                </FormField>
            </FormSection>
            <FormSection header='Input configuration'>
                <FormField label='Data type' controlId='formFieldIdS3DataType'>
                    <Select
                        placeholder='Choose an option'
                        options={s3DateTypeOptions}
                        selectedOption={selectedS3DataType}
                        onChange={(event) => onChange('formFieldIdS3DataType', event)}
                    />
                </FormField>
                <FormField label='S3 input path' controlId='formFieldIdS3InputUri'>
                    <Input type='text' placeholder='S3Uri' required={true} onChange={(event) => onChange('formFieldIdInputS3Uri', event)}/>
                </FormField>

                <FormField label='Content type' controlId='formFieldIdContentType'>
                    <Select
                        placeholder='Choose an option'
                        options={contentTypeOptions}
                        selectedOption={selectedContentType}
                        onChange={(event) => onChange('formFieldIdContentType', event)}
                    />
                </FormField>
            </FormSection>
            <FormSection header='Output configuration'>
                <FormField label='S3 output path' controlId='formFieldIdS3OutputUri'>
                    <Input type='text' placeholder='S3Uri' required={true} onChange={(event) => onChange('formFieldIdOutputS3Uri', event)}/>
                </FormField>
            </FormSection>
        </Form>
    );
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
)(TransformJobForm);