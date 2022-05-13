import { FunctionComponent, useEffect, useState } from 'react';
import { Toggle, Link, FormField, FormSection, Textarea, Text, Container, Stack, Inline, Button } from 'aws-northstar';
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

interface IProps {
    industrialModels: IIndustrialModel[];
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const CPTDemoForm: FunctionComponent<IProps> = (
    {
        industrialModels,        
        advancedMode,
        onAdvancedModeChange
    }) => {
    const [ text, setText ] = useState('')
    const [ summary, setSummary ] = useState('')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ loading, setLoading ] = useState(true);
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
        if(id === 'formFieldIdText') {
            setText(event)
        }
        if(id === 'formFieldIdSummary'){
            setSummary(event)
        }
    }

    useEffect(() => {
        var cancel = false
        const requests = [ axios.get('/function/all_in_one_ai_invoke_endpoint?action=code'), axios.get('/function/all_in_one_ai_invoke_endpoint?action=console')];
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
        return () => { 
            cancel = true;
        }
    }, []);

    useEffect(() => {
        if(industrialModel !== undefined) {
            setLoading(true)
            axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                .then((response) => {
                    var items = []
                    response.data.forEach((item) => {
                        items.push({label: item.EndpointName, value: item.EndpointName})
                        if(items.length === response.data.length) {
                            setEndpointOptions(items)
                            setSelectedEndpoint(items[0])
                            setLoading(false)
                        }
                    })
                }
            )
        }
    },[industrialModel]);

    const renderTextSummary = () => {
        return (
            <FormSection header='Text summarization'>
                <FormField controlId='Advanced mode'>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>                
                <FormField controlId='formFieldIdChooseEndpoint'>
                    <Text>
                        Select endpoint to inference
                    </Text>
                    <Select
                        placeholder='Choose endpoint'
                        options={endpointOptions}
                        selectedOption={selectedEndpoint}
                        onChange={(event) => onChange('formFieldIdEndpoint', event)}
                    />
                </FormField>
                <FormField controlId='formFieldIdText' description='Input the origin text'>
                    <Textarea onChange={(event) => onChange('formFieldIdText', event)}>{text}</Textarea>
                </FormField>
                <FormField controlId='formFieldIdSummary' description='Output the summarization'>
                    <Textarea onChange={(event) => onChange('formFieldIdSummary', event)}>{summary}</Textarea>
                </FormField>
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
                        <Button onClick={onStartTrain}>Start train</Button>
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
                <Toggle label={visibleSampleCode ? 'Show sample code' : 'Hide sample code'} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>Open in AWS Lambda console</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language='python' style={github} showLineNumbers={true}>
                        {sampleCode}
                    </SyntaxHighlighter>
                }
            </Container>
        )
    }    

    return (
        <Stack>
            { renderTextSummary() }
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
)(CPTDemoForm);