import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Toggle, Link, FormField, FormSection, Textarea, Container, Stack, Inline, Button, LoadingIndicator } from 'aws-northstar';
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
import { Pagination } from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Image from '../../Utils/Image';
import ImageAnnotate from '../../Utils/ImageAnnotate';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';

interface IProps {
    industrialModels: IIndustrialModel[];
    header: string;
    data: string;
    train_framework: string;
    deploy_framework: string;
}

const LocalImageDataForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        header,
        data,
        train_framework,
        deploy_framework
    }) => {
    const [ input, setInput ] = useState('{}');
    const [ invalidInput, setInvalidInput ] = useState(false);
    const [ endpointOptions, setEndpointOptions ] = useState([]);
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({});
    const [ sampleCode, setSampleCode ] = useState('');
    const [ sampleConsole, setSampleConsole ] = useState('');
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false);
    const [ selectedSampleFunction, setSelectedSampleFunction ] = useState<SelectOption>({});
    const [ processing, setProcessing ] = useState(false);
    const [ imageItems, setImageItems ] = useState([]);
    const [ curImageItem, setCurImageItem ] = useState('');
    const [ imagePage, setImagePage ] = useState(1);
    const [ imageCount, setImageCount ] = useState(0);
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false);
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
        if(id === 'formFieldIdPage')
            setImagePage(event)
    }

    useEffect(() => {
        setInput(data)
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


    const onRefresh = useCallback(() => {
        if(industrialModel !== undefined) {
            setLoading(true)
            axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                .then((response) => {
                    var items = []
                    if(response.data.length > 0) {
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
        setProcessing(true)
        var options = {headers: {'content-type': 'application/json'}, params : {endpoint_name: selectedEndpoint.value}} ;
        try {
            var jsonData = JSON.parse(input);
            var buffer = {inputs: jsonData};
            setProcessing(true);
            axios.post('/inference', buffer, options)
                .then((response) => {
                    var imageCount = response.data.length
                    var imageItems = []
                    response.data.forEach((s3uri) => {
                        axios.get('/s3', {params : { s3uri : s3uri }})
                        .then((response) => {
                            imageItems.push(response.data.payload[0])
                            if(imageItems.length === imageCount) {
                                setImageCount(imageCount);
                                setImageItems(imageItems)
                                setProcessing(false);
                            }
                        }, (error) => {
                            console.log(error)
                        })
                    })
                }, (error) => {
                        logOutput('error', error.response.data, undefined, error);
                        setProcessing(false);
                    }
                )
        } catch(e) {
            logOutput('error', t('industrial_models.demo.json_parse_error'), undefined, e);
        }
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
                    <Textarea onChange={(event) => onChange('formFieldIdInput', event)} value={input} invalid={invalidInput}/>
                </FormField>
                {
                    imageCount > 0 &&
                    <FormField controlId={uuidv4()} description={t('industrial_models.demo.output')}>
                        { renderImageList() }
                    </FormField>
                }
                <div className='run'>
                    <Button onClick={onRun} loading={processing}>{t('industrial_models.demo.run')}</Button>
                </div>
            </FormSection>
        )
    }

    const onImageClick = (httpuri) => {
        setCurImageItem(httpuri)
        setVisibleImagePreview(true)
    }

    const renderImageList = () => {
        if(processing)
            return (
                    <LoadingIndicator label={t('industrial_models.demo.loading')}/>
            )
        else {
            return (
                <Stack>
                    <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                        {
                            imageItems.length > 0 && 
                            imageItems.map((item) => (
                                <ImageListItem key={item.httpuri} rows={2}>
                                    <Image
                                        src={item.httpuri}
                                        httpuri={item.httprui}
                                        tooltip={`bucket=${item.bucket}\r\nkey=${item.key}`}
                                        width={128}
                                        height={128}
                                        current={curImageItem}
                                        onClick={() => onImageClick(item.httpuri)}
                                    />
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                    <div style={{textAlign: "center"}}>
                        <div style={{display: "inline-block", margin: "auto"}}>
                            <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.ceil(imageCount / 20)} />
                        </div>
                    </div>
                </Stack>
            )
        }
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

    const renderImagePreview = () => {        
        var imageItem = imageItems.find((item) => item.httpuri === curImageItem)
    
        var imageBucket = imageItem.bucket
        var imageKey = imageItem.key
        
        var imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))
    
        return (
            <ImageAnnotate 
                imageUris = {[curImageItem]} 
                imageLabels = {[]}
                imageColors = {[]} 
                imageBuckets = {[imageBucket]} 
                imageKeys = {[imageKey]}
                imageNames = {[imageName]}
                projectName = {industrialModel.name}
                type = {ProjectType.IMAGE_GENERIC}
                subType = {ProjectSubType.IMAGE_PREVIEW}
                onClosed = {() => {setVisibleImagePreview(false)}}
                activeIndex = {0}
            />
            )  
    }

    return (
        <Stack>
            { renderInference() }
            { renderQuickStart() }
            { renderSampleCode() }
            { visibleImagePreview && renderImagePreview() }
        </Stack>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(LocalImageDataForm);