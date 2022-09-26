import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Container, Link, Toggle, Select, Stack, FormField, Button, ProgressBar, LoadingIndicator, Inline } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';import axios from 'axios';
import Image from '../../../Utils/Image';
import { PathParams } from '../../../Interfaces/PathParams';
import Pagination from '@mui/material/Pagination';  
import '../../../Utils/Image/index.scss'
import { AppState } from '../../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import { SelectOption } from 'aws-northstar/components/Select';
import FileUpload from '../../../Utils/FileUpload';
import ImagePreview from '../../../Utils/ImagePreview';
import { v4 as uuidv4 } from 'uuid';
import '../index.scss'
import { useTranslation } from "react-i18next";
import { logOutput } from '../../../Utils/Helper';

interface IProps {
    industrialModels: IIndustrialModel[];
    advancedMode: boolean;
    onAdvancedModeChange: (checked) => any;
}

const GluonCVDemoForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        advancedMode,
        onAdvancedModeChange
    }) => {
    const [ originImageItems, setOriginImageItems ] = useState([])
    const [ searchImageItems, setSearchImageItems ] = useState([])
    const [ curOriginImageItem, setCurOriginImageItem ] = useState('')
    const [ curSearchImageItem, setCurSearchImageItem ] = useState('')
    const [ searchImage, setSearchImage ] = useState('')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ imagePage, setImagePage ] = useState(1)
    const [ imageCount, setImageCount ] = useState(0)
    const [ srcImagePreview, setSrcImagePreview ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ visibleSearchImage, setVisibleSearchImage ] = useState(false)
    const [ visibleOriginImagePreview, setVisibleOriginImagePreview ] = useState(false)
    const [ visibleSearchImagePreview, setVisibleSearchImagePreview ] = useState(false)
    const [ loading, setLoading ] = useState(true);
    const [ processing, setProcessing ] = useState(false);
    const [ importing, setImporting ] = useState(false);
    const [ importedCount, setImportedCount ] = useState(0);
    
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var industrialModel = industrialModels.find((item) => item.id === params.id)

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
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
            var s3uri = industrialModel.samples
            if(s3uri !== ''){
                axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: 20, include_filter : 'jpg,jpeg,png' }})
                    .then((response) => {
                        setOriginImageItems(response.data.payload);
                        setImageCount(response.data.count);
                        setLoading(false);
                    }
                )
            }
            else
                setLoading(false);
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
    },[imagePage, industrialModel]);

    const onOriginImageClick = (src) => {
        setSrcImagePreview(src)
        setVisibleOriginImagePreview(true)
    }

    const onSearchImageClick = () => {
        setSrcImagePreview(`/_image/${searchImage}`)
        setVisibleSearchImagePreview(true)
    }
    
    const onOriginImageClose = () => {
        setVisibleOriginImagePreview(false);
        setSrcImagePreview('')
    }

    const onSearchImageClose = () => {
        setVisibleSearchImagePreview(false);
        setSrcImagePreview('')
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
        else if(id === 'formFieldIdEndpoint')
            setSelectedEndpoint({label: event.target.value, value: event.target.value})
    }

    const onImportSamples = () => {
        setImporting(true)
        axios.get('/search/import', {params : {industrial_model : params.id, endpoint_name: selectedEndpoint.value, model_samples: industrialModel.samples}})
            .then((response) => {
                setTimeout(() => {
                    setImporting(false)
                  }, 60000);
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setImporting(false);
            })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if(imageCount === 0) return
            axios.get('/search/import', {params : {industrial_model : industrialModel.id, model_samples: industrialModel.samples, action: 'query'}})
            .then((response) => {
                var current = response.data.current;
                setImportedCount(Math.floor((current * 100) / imageCount));
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
            })
        }, 1000);
        return () => clearInterval(interval);
      }, [industrialModel, imageCount]);
      
    
    const renderOriginImageList = () => {
        if(loading)
            return (
                <Container headingVariant='h4' title = {t('industrial_models.demo.sample_data')}>
                    <LoadingIndicator label={t('industrial_models.demo.loading')}/>
                </Container>
            )
        else
            return (
                <Container 
                    headingVariant='h4'
                    title = {t('industrial_models.demo.sample_data')}
                    headerContent ={
                        <div>
                            <div style={{display: "inline-block", float: "right", marginRight: "5px", marginTop: "-32px"}}>
                            <Button 
                                onClick={onImportSamples} 
                                loading={importing}>{t('industrial_models.demo.import_images')}
                            </Button>
                            </div>
                        </div>
                    }
                >
                    <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                        {
                            originImageItems.map((item) => (
                                <ImageListItem key={item.httpuri} rows={2}>
                                    <Image
                                        src={item.httpuri}
                                        httpuri={item.httpuri}
                                        tooltip={`bucket=${item.bucket}\r\nkey=${item.key}`}
                                        width={128}
                                        height={128}
                                        current={curOriginImageItem}
                                        onClick={(src)=> {setCurOriginImageItem(src);onOriginImageClick(src)}}
                                    />
                                </ImageListItem>
                            ))
                        }
                    </ImageList>
                    <div style={{textAlign: "center"}}>
                        <div style={{display: "inline-block", margin: "auto"}}>
                            <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.floor(imageCount / 20) + 1} />
                        </div>
                    </div>
                    <ProgressBar value={importedCount} label={t('industrial_models.demo.import_progress')}/>
                </Container>
            )
    }

    const onFileChange = (file: File) => {
        axios.post('/_image', file)
            .then((response) => {
                var file_name : string = response.data;
                setSearchImage(file_name);
                setSearchImageItems([])
                setCurSearchImageItem('');
                setVisibleSearchImage(false);
            }, (error) => {
                if(error.response.status === 400)
                    logOutput('error', t('industrial_models.demo.file_size_over_6M'), undefined, error);
                else
                    logOutput('error', error.response.data, undefined, error);
            });
    }

    const onSearch = () => {
        setProcessing(true)
        axios.get('/_search/image', { params: {industrial_model: industrialModel.id, endpoint_name: selectedEndpoint.value, file_name: searchImage}})
            .then((response) => {
                setSearchImageItems(response.data);
                setVisibleSearchImage(true);
                setProcessing(false)
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false);
            });
    }

    const renderOriginImagePreview = () => {
        return (
            <ImagePreview src={srcImagePreview} width={"100%"} height={"100%"} visible={visibleOriginImagePreview} onClose={onOriginImageClose}/>
        )
    }

    const renderSearchImagePreview = () => {
        return (
            <ImagePreview src={srcImagePreview} width={"100%"} height={"100%"} visible={visibleSearchImagePreview} onClose={onSearchImageClose}/>
        )
    }

    const renderUploadImage = () => {
            return (
                <Container headingVariant='h4' title={t('industrial_models.demo.image_search')}>
                    <Inline>
                        <div className='quickstartaction'>
                            <FileUpload
                                text={t('industrial_models.demo.image_select')}
                                onChange={onFileChange}
                            />
                        </div>
                        <div className='quickstartaction'>
                            <Button disabled={searchImage === ''} onClick={onSearchImageClick}>{t('industrial_models.demo.image_preview')}</Button>
                        </div>
                        <div className='quickstartaction'>
                            <Button variant='primary' disabled={searchImage === ''} onClick={onSearch} loading={processing}>{t('industrial_models.demo.search')}</Button>
                        </div>
                    </Inline>
                </Container>
            )
    }

    const renderSearchImageList = () => {
        return (
            <Container headingVariant='h4' title = 'Browse result from search by image'>
                <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                    {
                        searchImageItems.map((item) => (
                            <ImageListItem key={item} rows={2}>
                                <Image
                                    src={item.httpuri}
                                    httpuri={item.httpuri}
                                    tooltip={`score=${item.score}`}
                                    width={128}
                                    height={128}
                                    current={curSearchImageItem}
                                    onClick={(src) => {setCurSearchImageItem(src);onOriginImageClick(src)}}
                                />
                            </ImageListItem>
                        ))
                    }
                </ImageList>
                <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.floor(searchImageItems.length / 20) + 1} />
            </Container>
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
                        <Button onClick={onStartTrain}>{t('industrial_models.demo.train')}</Button>
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
                <Toggle label={visibleSampleCode ? t('industrial_models.demo.show_sample_code') : t('industrial_models.demo.hide_sample_code')} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>{t('industrial_models.demo.open_function_in_aws_console')}</Link>
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
            <Container title = {t('industrial_models.demo.demo_options')}>
                <FormField controlId={uuidv4()} description={t('industrial_models.demo.select_endpoint')}>
                    <Select
                        options={endpointOptions}
                        selectedOption={selectedEndpoint}
                        onChange={(event) => onChange('formFieldIdEndpoint', event)}
                    />
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label={t('industrial_models.demo.advanced_mode')} checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            { renderOriginImagePreview() }
            { renderSearchImagePreview() }
            { renderOriginImageList() }
            { renderUploadImage() }
            { visibleSearchImage && renderSearchImageList() }
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
)(GluonCVDemoForm);