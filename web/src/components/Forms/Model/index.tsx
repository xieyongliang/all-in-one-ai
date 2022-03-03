import { FunctionComponent, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Input, Button, Text, Stack, RadioButton, RadioGroup } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';

interface PathParams {
    name: string;
}

interface ModelFormProps {
    wizard?: boolean;
}

const ModelForm: FunctionComponent<ModelFormProps> = (props) => {
    const [ modelName, setModelName ] = useState('')
    const [ containerIamge, setContainerImage ] = useState('')
    const [ modelDataUrl, setModelDataUrl ] = useState('')
    const [ containerType, setContainerType ] = useState('SingleModel')
    const [ tags ] = useState([{key:'', value:''}])
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidModelName, setInvalidModelName ] = useState(false)
    const [ invalidModelDataUrl, setInvalidModelDataUrl ] = useState(false)
    const history = useHistory();

    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdModelName')
            setModelName(event);
        if(id === 'formFieldIdContainerImage')
            setContainerImage(event)
        if(id === 'formFieldIdModelDataUrl')
            setModelDataUrl(event)
        if(id === 'formFieldIdMode')
            setContainerType(event)
    }

    const onChangeOptions = (event, value) => {
        setContainerType(value)
    }
    
    const onSubmit = () => {
        if(modelName === '')
            setInvalidModelName(true)
        else if(modelDataUrl === '')
            setInvalidModelDataUrl(true)
        else {
            var body = {
                'model_name' : modelName,
                'case_name': params.name,
                'container_image': containerIamge,
                'model_data_url': modelDataUrl,
                'mode': containerType
            }
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body['tags'] = tags
            axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=model`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });
        }
    }
 
    const onCancel = () => {
        history.push(`/case/${params.name}?tab=model`)
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

    const renderModelSetting = () => {
        if(!wizard) {
            return (
                <FormSection header='Model settings'>
                    <FormField label='Model name' controlId='formFieldIdModelName'>
                        <Input type='text' required={true} value={modelName} invalid={invalidModelName} onChange={(event)=>onChange('formFieldIdModelName', event)}/>
                    </FormField>
                </FormSection>
            )
        }
        else
            return ''
    }

    const renderModelTag = () => {
        if(!wizard) {
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
        }
        else
            return ''
    }

    const renderContainerOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='SingleModel' checked={containerType === 'SingleModel'}>Use a single model.</RadioButton>, 
                    <RadioButton value='MultiModel' checked={containerType === 'MultiModel'}>Use multiple models.</RadioButton>,
                ]}
            />
        )
    }

    const renderModelFormContent = () => {
        return (
            <FormSection header='Container definition'>
                <FormField controlId='formFieldId1'>
                    {renderContainerOptions()}
                </FormField>          
                <FormField label='Location of inference code image' description='Type the registry path where the inference code image is stored in Amazon ECR.' controlId='formFieldIdContainerImage'>
                    <Input type='text' value={containerIamge} placeholder={'default'} onChange={(event)=>{onChange('formFieldIdContainerImage', event)}} />
                </FormField>
                <FormField label='Location of model artifacts' description='Type the URL where model artifacts are stored in S3.' controlId='formFieldIdModelDataUrl'>
                    <Input type='text' required={true} value={modelDataUrl} invalid={invalidModelDataUrl} onChange={(event)=>{onChange('formFieldIdModelDataUrl', event)}} />
                </FormField>
        </FormSection>    
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create model'
                description='To deploy a model to Amazon SageMaker, first create the model by providing the location of the model artifacts and inference code.'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit}>Submit</Button>
                    </div>
                }>            
                {renderModelSetting()}
                {renderModelFormContent()}
                {renderModelTag()}
            </Form>
        )
    }
}

export default ModelForm;