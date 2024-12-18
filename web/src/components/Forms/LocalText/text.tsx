import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Toggle, Link, FormField, FormSection, Textarea, Container, Stack, Inline, Button } from 'aws-northstar';
import axios from 'axios';
import Select, { SelectOption } from 'aws-northstar/components/Select';
import { PathParams } from '../../Interfaces/PathParams';
import { useHistory, useParams } from 'react-router-dom';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { v4 as uuidv4 } from 'uuid';
import { ALGORITHMS } from '../../Data/data';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

interface IProps {
    industrialModels: IIndustrialModel[];
    header: string;
    data?: string;
    train_framework: string;
    deploy_framework: string;
}

const LocalTextOutputTextForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        header,
        data,
        train_framework,
        deploy_framework
    }) => {
    const [ input, setInput ] = useState('')
    const [ output, setOutput ] = useState('')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ selectedSampleFunction, setSelectedSampleFunction ] = useState<SelectOption>({})
    const [ processing, setProcessing ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    const sampleFunctionOptions = [
        {
            label: 'all_in_one_ai_train',
            value: 'all_in_one_ai_train'
        },
        {
            label: `all_in_one_ai_create_train_${train_framework}`,
            value: `all_in_one_ai_create_train_${train_framework}`
        },
        {
            label: 'all_in_one_ai_deploy',
            value: 'all_in_one_ai_deploy'
        },
        {
            label: `all_in_one_ai_create_deploy_${deploy_framework}`,
            value: `all_in_one_ai_create_deploy_${deploy_framework}}`
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

    const { t } = useTranslation();

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
        if(id === 'formFieldIdInput') {
            setInput(event.target.value)
        }
    }

    useEffect(() => {
        setInput(data)
        setOutput('')
    }, [data])

    useEffect(() => {
        var cancel = false
        if(selectedSampleFunction.value !== undefined) {
            const requests = [ axios.get(`/function/${selectedSampleFunction.value}?action=code`), axios.get(`/function/${selectedSampleFunction.value}?action=console`)];
            axios.all(requests)
            .then(axios.spread(function(response, response1) {
                getSourceCode(response.data).then((data) => {
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

    const onRefresh = useCallback(() => {
        if(industrialModel !== undefined) {
            setLoading(true)
            axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                .then((response) => {
                    var items = []
                    if(response.data.length > 0 ) {
                        response.data.forEach((item) => {
                            items.push({label: item.EndpointName, value: item.EndpointName})
                            if(items.length === response.data.length) {
                                setEndpointOptions(items);
                                setSelectedEndpoint(items[0]);
                                setLoading(false);
                            }
                        })
                    }
                    else
                        setLoading(false);
                }, (error) => {
                    logOutput('error', error.response.data, undefined, error);
                    setProcessing(false);
                }
            )
        }
    },[industrialModel])

    useEffect(() => {
        onRefresh()
    },[onRefresh])

    const onRun = () => {
        var options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: selectedEndpoint.value}};
        var buffer = {inputs: input}
        setProcessing(true)
        axios.post('/inference', buffer, options)
            .then((response) => {
                setOutput(response.data.result)
                setProcessing(false);
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                    setProcessing(false);
                }
            )
    }

    const renderInference = () => {
        return (
            <FormSection header={header}>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.select_endpoint')}>
                    <Inline>
                        <Select
                            options={endpointOptions}
                            selectedOption={selectedEndpoint}
                            onChange={(event) => onChange('formFieldIdEndpoint', event)}
                        />
                        <Button icon={'refresh'} loading={loading} onClick={onRefresh}>{t('industrial_models.common.refresh')}</Button>
                    </Inline>
                </FormField>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.input')}>
                    <Textarea onChange={(event) => onChange('formFieldIdInput', event)} value={input}/>
                </FormField>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.output')}>
                    <Textarea onChange={(event) => onChange('formFieldIdOutput', event)} value={output} readonly={true}/>
                </FormField>
                <div>
                    <Button onClick={onRun} loading={processing}>{t('industrial_models.demo.run')}</Button>
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
            <Container headingVariant='h4' title = {t('industrial_models.demo.quick_start')}>
                <Inline>
                    <div className='quickstartaction'>
                        <Button onClick={onStartTrain} disabled={!ALGORITHMS.find(algorithm => algorithm.value === industrialModel.algorithm).trainable}>{t('industrial_models.demo.train')}</Button>
                    </div>
                    <div className='quickstartaction'>
                        <Button onClick={onStartDeploy}>{t('industrial_models.demo.deploy')}</Button>
                    </div>
                </Inline>
            </Container>
        )
    }

    const renderSampleCode = () => {
        return (
            <Container headingVariant='h4' title = {t('industrial_models.demo.sample_code')}>
                <FormField controlId={uuidv4()}>
                    <Select
                            options={sampleFunctionOptions}
                            selectedOption={selectedSampleFunction}
                            onChange={(event) => onChange('formFieldIdSampleFunction', event)}
                        />
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label={visibleSampleCode ? t('industrial_models.demo.show_sample_code') : t('industrial_models.demo.hide_sample_code')} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                    <Link href={sampleConsole}>{t('industrial_models.demo.open_function_in_aws_console')}</Link>
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
            { renderInference() }
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
)(LocalTextOutputTextForm);