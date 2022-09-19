import { FunctionComponent, useEffect, useState } from 'react';
import { Toggle, Link, FormField, FormSection, Textarea, Container, Stack, Inline, Button } from 'aws-northstar';
import LineChart, { Line, NORTHSTAR_COLORS, YAxis, XAxis, Tooltip, CartesianGrid, Legend } from 'aws-northstar/charts/LineChart';
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
import ReactJson from 'react-json-view';
import { ALGORITHMS } from '../../Data/data';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../Utils/Helper';

interface IProps {
    industrialModels: IIndustrialModel[];
    header: string;
    data: string;
    train_framework: string;
    deploy_framework: string;
}

const LocalDataForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        header,
        data,
        train_framework,
        deploy_framework
    }) => {
    const [ input, setInput ] = useState('{}')
    const [ output, setOutput ] = useState([])
    const [ invalidInput, setInvalidInput ] = useState(false)
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ selectedSampleFunction, setSelectedSampleFunction ] = useState<SelectOption>({})
    const [ processing, setProcessing ] = useState(false);

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
            value: `all_in_one_ai_create_deploy_${deploy_framework}`
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
            try {
                JSON.parse(event.target.value)
                setInvalidInput(false)
            }
            catch(e) {
                setInvalidInput(true)
            }
        }
    }

    useEffect(() => {
        setInput(data)
        setOutput([])
    }, [data])

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
        var options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: selectedEndpoint.value}} ;
        try {
            var jsonData = JSON.parse(input);
            var prediction_length = jsonData.prediction_length;
            if(prediction_length === undefined)
                prediction_length = 24
            var jsonData0 = JSON.parse(JSON.stringify(jsonData))
            jsonData0.target = jsonData0.target.slice(0, jsonData0.target.length - prediction_length)
            var buffer = {inputs: [jsonData0, jsonData]};
            setProcessing(true);
            axios.post('/inference', buffer, options)
                .then((response) => {
                    setOutput(response.data.result);
                    setProcessing(false);
                }, (error) => {
                        logOutput('error', error.response.data, undefined, error);
                        setProcessing(false);
                    }
                )
        } catch(e) {
            logOutput('error', t('industrial_models.demo.json_parse_error'), undefined, e);
        }
    }

    const renderChart = () => {
        if(input === '{}') 
            return (
                <div/>
            )
        try {
            var jsonData = JSON.parse(input);
        } catch(e) {
            return (
                <div/>
            )
        }

        var start = new Date(jsonData.start);
        var target = jsonData.target;
        var item_id = jsonData.item_id;
        var freq = jsonData.freq;
        var prediction_length = jsonData.prediction_length
        if(freq === undefined)
            freq = '1M';

        prediction_length = output.length === 0 ? 0 : (prediction_length !== undefined ? prediction_length : 24);
        
        var freqUnit = freq.substring(freq.length - 1)

        if(freqUnit !== 'Y' && freqUnit !== 'M' && freqUnit !== 'D' && freqUnit !== 'H' && freqUnit !== 'M' && freqUnit !== 'S')
            return (
                <div/>
            );

        var freqNum = freq.length > 1 ? parseInt(freq.substring(0, freq.length - 1)) : 1

        const chartData = [];

        var target_length = target.length;

        for(let i = 0; i < target_length + prediction_length; i++) {
            var name : string;

            if(freqUnit === 'Y') {
                start.setFullYear(start.getFullYear() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric'
                  }
                )
            }
            else if(freqUnit === 'M') {
                start.setMonth(start.getMonth() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit'
                  }
                )
            }
            else if(freqUnit === 'D') {
                start.setDate(start.getDate() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  }
                )
            }
            else if(freqUnit === 'H') {
                start.setHours(start.getHours() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit'
                  }
                )
            }
            else if((freqUnit === 'M')) {
                start.setMinutes(start.getMinutes() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )
            }
            else {
                start.setSeconds(start.getSeconds() + freqNum)
                name = start.toLocaleDateString([], {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  }
                )
            }
             
            if(i >= target_length)
                chartData.push(
                    {
                        name: `   ${name}   `, 
                        prediction: output[1][i - target_length]
                    }
                )
            else if(i >= target_length - prediction_length)
                chartData.push(
                    {
                        name: `   ${name}   `, 
                        data: target[i],
                        prediction: output[0][i - target_length + prediction_length]
                    }
                )
            else
                chartData.push(
                    {
                        name: `   ${name}   `, 
                        data: target[i]
                    }
                )
        };

        return (
            <div>
                <LineChart title={item_id} width={1000} height={500} data={chartData}>
                    <CartesianGrid strokeDasharray="1 1" />
                    <Line dataKey='data' name={t('industrial_models.demo.original_data')} stroke={NORTHSTAR_COLORS.ORANGE} fill={NORTHSTAR_COLORS.ORANGE} />
                    <Line dataKey='prediction' name={t('industrial_models.demo.prediction_data')} stroke={NORTHSTAR_COLORS.BLUE} fill={NORTHSTAR_COLORS.BLUE} />
                    <XAxis dataKey="name"/>
                    <YAxis />
                    <Tooltip />
                    <Legend />
                </LineChart>
            </div>
        )
    }

    const renderJSON = () => {
        if(input === '{}')
            return (
                <div />
            )

        try {
            var json = JSON.parse(input);
        } catch(e) {
            return (
                <div />
            )
        }

        return (
            <FormField controlId={uuidv4()} description={t('industrial_models.demo.data')}>
                <ReactJson src={json} collapsed={false} theme='google' />
            </FormField>
        )
    }

    const renderInference = () => {
        return (
            <FormSection header={header}>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.select_endpoint')}>
                    <Select
                        options={endpointOptions}
                        selectedOption={selectedEndpoint}
                        onChange={(event) => onChange('formFieldIdEndpoint', event)}
                    />
                </FormField>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.input')}>
                    <Textarea onChange={(event) => onChange('formFieldIdInput', event)} value={input} invalid={invalidInput}/>
                </FormField>
                { renderJSON() }
                <div className='run'>
                    <Button onClick={onRun} loading={processing}>{t('industrial_models.demo.run')}</Button>
                </div>
                { renderChart() }
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
)(LocalDataForm);