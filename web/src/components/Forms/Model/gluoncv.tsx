import { FunctionComponent, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { FormSection, FormField, Input, Button, Text, Stack, RadioButton, RadioGroup, Form } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { PathParams } from '../../Interfaces/PathParams';

interface IProps {
    pipelineType: string;
    industrialModels : IIndustrialModel[];
    wizard?: boolean;
}

const GluonCVModelForm: FunctionComponent<IProps> = (props) => {
    const [ modelName, setModelName ] = useState('')
    const [ containerIamge, setContainerImage ] = useState('')
    const [ containerModelType, setContainerModelType ] = useState('SingleModel')
    const [ tags, setTags ] = useState([{key:'', value:''}])
    const [ invalidModelName, setInvalidModelName ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    var wizard : boolean
    
    if(props.wizard === undefined)
        wizard = false
    else
        wizard = props.wizard

    const onChange = (id: string, event: any, option?: string) => {
        if(id === 'formFieldIdModelName')
            setModelName(event);
        else if(id === 'formFieldIdContainerImage')
            setContainerImage(event)
    }

    const onSubmit = () => {
        var body = {}
        console.log(props.industrialModels)
        console.log(params.id)
        var index = props.industrialModels.findIndex((item) => item.id === params.id)
        var algorithm = props.industrialModels[index].algorithm

        if(modelName === '')
            setInvalidModelName(true)
        else
        {
            body = {
                'model_name' : modelName,
                'industrial_model': params.id,
                'model_algorithm': algorithm,
                'container_image': containerIamge,
                'mode': containerModelType
            }
                
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body['tags'] = tags
            axios.post('/model', body,  { headers: {'content-type': 'application/json' }}) 
                .then((response) => {
                    history.goBack()
                }, (error) => {
                    alert('Error occured, please check and try it again');
                    console.log(error);
                }
            );
        }
    }
 
    const onCancel = () => {
        history.goBack()
    }

    const onAddTag = () => {
        tags.push({key:'', value:''});
        setTags(tags)
    }

    const onRemoveTag = (index) => {
        tags.splice(index, 1);
        setTags(tags)
    }

    const onChangeOptions = (event, value) => {
        setContainerModelType(value)
    }

    const renderModelSetting = () => {
        return (
            <FormSection header='Model settings'>
                <FormField label='Model name' controlId='formFieldIdModelName'>
                    <Input type='text' required={true} value={modelName} invalid={invalidModelName} onChange={(event)=>onChange('formFieldIdModelName', event)}/>
                </FormField>
            </FormSection>
        )
    }

    const renderContainerDefinition = () => {
        return (
            <FormSection header='Container definition'>
                 <FormField controlId='formFieldIdContainerModelOptions'>
                    <RadioGroup onChange={onChangeOptions}
                        items={[
                            <RadioButton value='SingleModel' checked={containerModelType === 'SingleModel'}>Use a single model.</RadioButton>, 
                            <RadioButton value='MultiModel' checked={containerModelType === 'MultiModel'}>Use multiple models.</RadioButton>,
                        ]}
                    />
                </FormField>
                <FormField label='Container image' controlId='formFieldIdContainerImage'>
                    <Input type='text' required={true} value={containerIamge} onChange={(event)=>onChange('formFieldIdContainerImage', event)}/>
                </FormField>
            </FormSection>
        )
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


    if(wizard) {
        return (
            <Stack>
                { renderContainerDefinition() }
                { renderModelTag() }
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
                { renderModelSetting() }
                { renderContainerDefinition() }
                { renderModelTag() }
            </Form>
        )
    }
}

const mapStateToProps = (state: AppState) => ({
    pipelineType: state.pipeline.pipelineType,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(GluonCVModelForm);