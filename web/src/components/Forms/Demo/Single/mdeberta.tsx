import { FunctionComponent, useEffect, useState } from 'react';
import { Toggle, Link, FormField, FormSection, Textarea, Container, Stack, Inline, Button, Input } from 'aws-northstar';
import Grid from '@mui/material/Grid';
import axios from 'axios';
import Select, { SelectOption } from 'aws-northstar/components/Select';
import { PathParams } from '../../../Interfaces/PathParams';
import { useHistory, useParams } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import { AppState } from '../../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import { v4 as uuidv4 } from 'uuid';
import ReactJson from 'react-json-view';

interface IProps {
    industrialModels: IIndustrialModel[];
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const sampleFunctionOptions = [
    {
        label: 'all_in_one_ai_train',
        value: 'all_in_one_ai_train'
    },
    {
        label: 'all_in_one_ai_deploy',
        value: 'all_in_one_ai_deploy'
    },
    {
        label: 'all_in_one_ai_create_deploy_huggingface',
        value: 'all_in_one_ai_create_deploy_huggingface'
    },
    {
        label: 'all_in_one_ai_inference',
        value: 'all_in_one_ai_inference'
    },
    {
        label: 'all_in_one_ai_invoke_endpoint',
        value: 'all_in_one_ai_invoke_endpoint'
    }
]

const DeBERTaDemoForm: FunctionComponent<IProps> = (
    {
        industrialModels,        
        advancedMode,
        onAdvancedModeChange
    }) => {
    const [ text, setText ] = useState('')
    const [ labels, setLabels ] = useState([])
    const [ result, setResult ] = useState('{}')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ selectedSampleFunction, setSelectedSampleFunction ] = useState<SelectOption>({})
    const [ processing, setProcessing ] = useState(false);
    const history = useHistory();

    var params : PathParams = useParams();

    var industrialModel = industrialModels.find((item) => item.id === params.id)

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdEndpoint') {
            setSelectedEndpoint({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdSampleFunction') {
            setSelectedSampleFunction({label: event.target.value, value: event.target.value})
        }
        if(id === 'formFieldIdText') {
            setText(event.target.value)
        }
    }

    useEffect(() => {
        var cancel = false
        if(selectedSampleFunction.value !== undefined) {
            const requests = [ axios.get(`/function/${selectedSampleFunction.value}?action=code`), axios.get(`/function/${selectedSampleFunction.value}?action=console`)];
            axios.all(requests)
            .then(axios.spread(function(response0, response1) {
                getSourceCode(response0.data).then((data) => {
                    if(cancel) return;
                    var zip = new JSZip();
                    zip.loadAsync(data).then(async function(zipped) {
                        zipped.file('lambda_function.py').async('string').then(function(data) {
                            if(cancel) return;
                            setSampleCode(data)
                        })
                    })
                });
                setSampleConsole(response1.data)           
            }));
        }
        return () => { 
            cancel = true;
        }
    }, [selectedSampleFunction]);    

    useEffect(() => {
        if(industrialModel !== undefined) {
            axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                .then((response) => {
                    var items = []
                    response.data.forEach((item) => {
                        items.push({label: item.EndpointName, value: item.EndpointName})
                        if(items.length === response.data.length) {
                            setEndpointOptions(items)
                            setSelectedEndpoint(items[0])
                        }
                    })
                }
            )
        }
    },[industrialModel]);

    const onRun = () => {
        var options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: selectedEndpoint.value}};
        var buffer = {inputs: text, parameters: {candidate_labels : labels}}
        setProcessing(true)
        axios.post('/inference', buffer, options)
            .then((response) => {
                setResult(JSON.stringify(response.data))
                setProcessing(false);
            }, (error) => {
                    console.log(error);
                    setProcessing(false);
                }
            ).catch((e) => {
                console.log(e);
            }
        );
    }

    const onAddLabel = () => {
        var copyLabels = JSON.parse(JSON.stringify(labels));
        copyLabels.push('');
        setLabels(copyLabels);
    }

    const onRemoveLabel = (index) => {
        var copyLabels = JSON.parse(JSON.stringify(labels));
        copyLabels.splice(index, 1);
        setLabels(copyLabels);
    }


    const onChangeLabels = (event: any, index : number) => {
        var copyLabels = JSON.parse(JSON.stringify(labels));
        copyLabels[index] = event
        setLabels(copyLabels)
    }   

    const renderLabels = () => {
        return (
            <FormField controlId={uuidv4()} description='Candidate labels'>
                {
                    labels.map((label, index) => (
                        <Grid container spacing={{ xs: 1, md: 1 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid item xs={2} sm={4} md={4}>
                                <Input type='text' value={label} onChange={(event) => onChangeLabels(event, index)}/>
                            </Grid>
                            <Grid item xs={2} sm={4} md={4}>
                                <Button onClick={() => onRemoveLabel(index)}>Remove</Button>
                            </Grid>
                        </Grid>
                    ))
                }
                <Button variant='link' size='large' onClick={onAddLabel}>Add label</Button>
                </FormField>
            )
    }

    const renderTextClassfication = () => {
        return (
            <FormSection header='Zero shot classification'>
                <FormField controlId={uuidv4()}>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>                
                <FormField controlId={uuidv4()} description='Select endpoint to inference'>
                    <Select
                        placeholder='Choose endpoint'
                        options={endpointOptions}
                        selectedOption={selectedEndpoint}
                        onChange={(event) => onChange('formFieldIdEndpoint', event)}
                    />
                </FormField>
                <FormField controlId={uuidv4()} description='Input the origin text'>
                    <Textarea onChange={(event) => onChange('formFieldIdText', event)} value={text}/>
                </FormField>
                {
                    renderLabels()
                }
                {
                    result !== '{}' && 
                    <FormField controlId={uuidv4()} description='Inference result'>
                        <ReactJson src={JSON.parse(result)} collapsed={false} theme='google' />
                    </FormField>
                }
                <div className='run'>
                    <Button onClick={onRun} loading={processing}>Run</Button>
                    </div>
            </FormSection>
        )
    }

    const onStartTrain = () => {
        history.push(`/imodels/${params.id}?tab=train#create`)
    }

    const onStartDeploy = () => {
        history.push(`/imodels/${params.id}?tab=deploy#create`)
    }

    const renderQuickStart = () => {
        return (
            <Container headingVariant='h4' title = 'Quick start'>
                <Inline>
                    <div className='quickstartaction'>
                        <Button onClick={onStartTrain} disabled={true}>Start train</Button>
                    </div>
                    <div className='quickstartaction'>
                        <Button onClick={onStartDeploy}>Start deploy</Button>
                    </div>
                </Inline>
            </Container>
        )
    }

    const renderSampleCode = () => {
        return (
            <Container headingVariant='h4' title = 'Sample code'>
                <FormField controlId={uuidv4()}>
                    <Select
                            placeholder='Choose function'
                            options={sampleFunctionOptions}
                            selectedOption={selectedSampleFunction}
                            onChange={(event) => onChange('formFieldIdSampleFunction', event)}
                        />
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label={visibleSampleCode ? 'Show sample code' : 'Hide sample code'} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                    <Link href={sampleConsole}>Open in AWS Lambda console</Link>
                    {
                        visibleSampleCode && <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                            {sampleCode}
                        </SyntaxHighlighter>
                    }
                </FormField>
            </Container>
        )
    }    

    return (
        <Stack>
            { renderTextClassfication() }
            { renderQuickStart() }
            { renderSampleCode() }
        </Stack>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(DeBERTaDemoForm);