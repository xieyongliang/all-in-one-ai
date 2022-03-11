import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom'; 
import { Form, FormSection, FormField, Input, Button, Text, Stack, Select, RadioButton, RadioGroup } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import { PathParams } from '../../Interfaces/PathParams';
import { APIS } from '../../Data/data';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { UpdateApiFuntion, UpdateApiMethod, UpdateApiPath, UpdateApiRestApiId, UpdateApiRestApiName, UpdateApiStage, UpdateApiType } from '../../../store/pipelines/actionCreators';

interface IProps {
    updateApiRestApiNameAction: (apiRestApiName: string) => any;
    updateApiRestApiIdAction: (apiRestApiId: string) => any;
    updateApiTypeAction: (apiType: string) => any;
    updateApiPathAction: (apiPath: string) => any;
    updateApiStageAction: (apiStage: string) => any;
    updateApiFuntionAction: (apiFunction: string) => any;
    updateApiMethodAction: (apiMethod: string) => any;
    apiRestApiName : string;
    apiRestApiId : string;
    apiType: string;
    apiPath : string;
    apiStage : string;
    apiFunction : string;
    wizard?: boolean;
}

const RestApiForm: FunctionComponent<IProps> = (props) => {
    const [ apiName, setApiName ] = useState('')
    const [ restApiName, setRestApiName ] = useState(props.wizard ? props.apiRestApiName : '')
    const [ selectedRestApis, setSelectedRestApis ] = useState<SelectOption>({})
    const [ selectedApis, setSelectedApis ] = useState<SelectOption>(props.wizard ? {label: 'inerence', value:'inference'}: {})
    const [ apiPath, setApiPath ] = useState(props.wizard ? props.apiPath : '')
    const [ apiStage, setApiStage ] = useState(props.wizard ? props.apiStage : '')
    const [ apiMethod, setApiMethod ] = useState(props.wizard ? APIS['inference'].method : '')
    const [ apiFunction, setApiFunction ] = useState(props.wizard ? APIS['inference'].function : '')
    const [ apiType, setApiType] = useState(props.wizard ? props.apiType : '1')
    const [ tags ] = useState([{key:'', value:''}])
    const [ optionsRestApis, setOptionsRestApis ] = useState([]);
    const [ optionsApis, setOptionsApis ] = useState([]);
    const [ forcedRefresh, setForcedRefresh ] = useState(false)
    const [ invalidApiName, setInvalidApiName ] = useState(false)
    const [ invalidRestApi, setInvalidRestApi] = useState(false)
    const [ invalidApis, setInvalidApis] = useState(false)
    const [ invalidRestApiName, setInvalidRestApiName ] = useState(false)
    const [ invalidApiPath, setInvalidApiPath ] = useState(false)
    const [ invalidApiStage, setInvalidApiStage ] = useState(false)

    const history = useHistory();

    var params : PathParams = useParams();

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdApiName') {
            setApiName(event)
        }
        if(id === 'formFieldIdRestApis') {
            setSelectedRestApis({label: event.target.value, value: event.target.value});
            props.updateApiRestApiIdAction(event.target.value)
        }
        if(id === 'formFieldIdApis') {
            setSelectedApis({label: event.target.value, value: event.target.value});
            setApiFunction(APIS[event.target.value].function)
            setApiMethod(APIS[event.target.value].method)
            props.updateApiFuntionAction(APIS[event.target.value].function)
            props.updateApiMethodAction(APIS[event.target.value].method)
        }
        if(id === 'formFieldIdRestApiName') {
            setRestApiName(event);
            props.updateApiRestApiNameAction(event);
        }
        if(id === 'formFieldIdApiPath') {
            setApiPath(event);
            props.updateApiPathAction(event);
        }
        if(id === 'formFieldIdApiStage') {
            setApiStage(event);
            props.updateApiStageAction(event);
        }
    }

    const onChangeOptions = (event, value)=>{
        setApiType(value);
        props.updateApiTypeAction(value);
    }

    useEffect(() => {
        axios.get(`/api?query=restapis`)
            .then((response) => {
            var items = []
            for(let item of response.data) {
                items.push({label: item.name, value: item.id})
                if(wizard) {
                    if(item.id === props.apiRestApiId) 
                        setSelectedRestApis({label: item.name, value: item.id})
                }
            }
            setOptionsRestApis(items);
            props.updateApiFuntionAction(apiFunction)
            props.updateApiMethodAction(apiMethod)
        }, (error) => {
            console.log(error);
        });
        
        var apis = [];

        for(let api in APIS) {
            apis.push({key: api, value: api})
        }
        setOptionsApis(apis);
    }, [])

    const onSubmit = () => {
        if(apiName === '')
            setInvalidApiName(true)
        else if(apiType === '1' && selectedRestApis.value === undefined)
            setInvalidRestApi(true)
        else if(selectedApis.value === undefined)
            setInvalidApis(true)
        else if(apiType === '0' && restApiName === '')
            setInvalidRestApiName(true)        
        else if(apiPath === '' || apiPath.startsWith('/') )
            setInvalidApiPath(true)
        else if(apiStage === '')
            setInvalidApiStage(true)
        else {
            var body = {
                'api_name': apiName,
                'case_name': params.name,
                'rest_api_name' : restApiName,
                'rest_api_id': selectedRestApis.value,
                'api_path': apiPath,
                'api_stage': apiStage,
                'api_method': apiMethod,
                'api_function': apiFunction
            }
            if(tags.length > 1 || (tags.length === 1 && tags[0].key !== '' && tags[0].value !== ''))
                body['tags'] = tags
            axios.post('/api', body,  { headers: {'content-type': 'application/json' }}) 
            .then((response) => {
                history.push(`/case/${params.name}?tab=restapi`)
            }, (error) => {
                alert('Error occured, please check and try it again');
                console.log(error);
            });
        }
    }

    const onCancel = () => {
        history.push('/case/' + params.name + '?tab=restapi')
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

    const renderApiOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='0' checked={apiType === '0'}>Create new Rest API.</RadioButton>, 
                    <RadioButton value='1' checked={apiType === '1'}>Select existing Rest API.</RadioButton>,
                ]}
            />
        )
    }

    const renderRestApiSetting = () => {
        if(apiType === '1') {
            return (
                <FormSection header='API setting'>
                    {
                        !wizard &&
                        <FormField label='API name' controlId='formFieldIdApiName'>
                            <Input type='text' value={apiName} invalid={invalidApiName} onChange={(event) => onChange('formFieldIdApiName', event)} />
                        </FormField>
                    }
                    <FormField label='API gateway' controlId='formFieldIdApiType'>
                        {renderApiOptions()}
                    </FormField>
                    <FormField controlId='formFieldIdRestApis'>
                        <Select
                            placeholder='Choose an option'
                            options={optionsRestApis}
                            selectedOption={selectedRestApis}
                            invalid={invalidRestApi}
                            onChange={(event) => onChange('formFieldIdRestApis', event)}
                        />
                    </FormField>
                </FormSection>
            )
        }
        else {
            return (
                <FormSection header='API setting'>
                    {
                        !wizard &&
                        <FormField label='API name' controlId='formFieldIdName'>
                            <Input type='text' value={apiName} invalid={invalidApiName} />
                        </FormField>
                    }
                    <FormField label='API gateway' controlId='formFieldIdRestApi'>
                        {renderApiOptions()}
                    </FormField>
                    <FormField controlId='formFieldIdRestApiName'>
                        <Input type='text' value={restApiName} invalid={invalidRestApiName} onChange={(event) => onChange('formFieldIdRestApiName', event)}/>
                    </FormField>
                </FormSection>
            )
        }
    }

    const renderRestApiTag = () => {
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

    const renderRestApiFormContent = () => {
        return (
            <FormSection header='Production variants'>
                <FormField label='API path' controlId='formFieldIdApiPath'>
                    <Input type='text' value={apiPath} invalid={invalidApiPath} onChange={(event) => onChange('formFieldIdApiPath', event)} />
                </FormField>
                <FormField label='API stage' controlId='formFieldIdApiStage'>
                    <Input type='text' value={apiStage} invalid={invalidApiStage} onChange={(event) => onChange('formFieldIdApiStage', event)}/>
                </FormField>
                <FormField controlId='formFieldIdApis' label='APIs to deployed' >
                    <Select
                        placeholder='Choose an option'
                        options={optionsApis}
                        selectedOption={selectedApis}
                        invalid={invalidApis}
                        onChange={(event) => onChange('formFieldIdApis', event)}
                    />
                </FormField>
            </FormSection>
        )
    }

    if(wizard) {
        return (
            <Stack>
                {renderRestApiSetting()}
                {renderRestApiFormContent()}
                {renderRestApiTag()}
            </Stack>
        )
    }
    else {
        return (
            <Form
                header='Create restapi'
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>Cancel</Button>
                        <Button variant='primary' onClick={onSubmit}>Submit</Button>
                    </div>
                }> 
                {renderRestApiSetting()}
                {renderRestApiFormContent()}
                {renderRestApiTag()}
            </Form>
        )
    }
}

const mapDispatchToProps = {
    updateApiRestApiNameAction: UpdateApiRestApiName,
    updateApiRestApiIdAction: UpdateApiRestApiId,
    updateApiTypeAction: UpdateApiType,
    updateApiPathAction: UpdateApiPath,
    updateApiStageAction: UpdateApiStage,
    updateApiFuntionAction: UpdateApiFuntion,
    updateApiMethodAction: UpdateApiMethod
};

const mapStateToProps = (state: AppState) => ({
    apiRestApiName : state.pipeline.apiRestApiName,
    apiRestApiId : state.pipeline.apiRestApiId,
    apiType: state.pipeline.apiType,
    apiPath : state.pipeline.apiPath,
    apiStage : state.pipeline.apiStage,
    apiFunction : state.pipeline.apiFunction,
    apiMethod: state.pipeline.apiMethod
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RestApiForm);