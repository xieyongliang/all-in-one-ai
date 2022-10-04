import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Container, Link, Toggle, Select, Stack, FormField, Button, ProgressBar, LoadingIndicator, Inline, RadioGroup, RadioButton } from 'aws-northstar';
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
import { v4 as uuidv4 } from 'uuid';
import '../index.scss'
import { useTranslation } from "react-i18next";
import { logOutput } from '../../../Utils/Helper';
import TransformJobForm from '../../TransformJob'
import ImportImage from '../../ImportImage';
import { ProjectSubType, ProjectType } from '../../../../data/enums/ProjectType';
import ImageAnnotate from '../../../Utils/ImageAnnotate';

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
    const [ originImageName, setOriginImageName ] = useState('')
    const [ curOriginImageItem, setCurOriginImageItem ] = useState('')
    const [ curSearchImageItem, setCurSearchImageItem ] = useState('')
    const [ searchImage, setSearchImage ] = useState('')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ imagePage, setImagePage ] = useState(1)
    const [ imageCount, setImageCount ] = useState(0)
    const [ imagePreviewSrc, setImagePreviewSrc ] = useState('')
    const [ imageSearchResultSrc, setImageSearchResultSrc ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ visibleSearchImage, setVisibleSearchImage ] = useState(false)
    const [ visibleOriginImagePreview, setVisibleOriginImagePreview ] = useState(false)
    const [ visibleSearchImagePreview, setVisibleSearchImagePreview ] = useState(false)
    const [ visibleSearchResultPreview, setVisibileSearchResultPreview ] = useState(false)
    const [ loading, setLoading ] = useState(true);
    const [ processing, setProcessing ] = useState(false);
    const [ importedCount, setImportedCount ] = useState(0);
    const [ visibleImportImage, setVisibleImportImage ] = useState(false)
    
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var industrialModel = industrialModels.find((item) => item.id === params.id);

    var task = JSON.parse(industrialModel.extra).task;

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    const [ demoOption, setDemoOption ] = useState(task === 'search' ? 'import_with_realtimeinference' : (hash === 'sample' || hash === 'local' || hash === 'transformjob' ? hash : 'sample'))

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
    }

    if(task === 'search') {
        if(demoOption !== 'import_with_realtimeinference' && demoOption !== 'import_with_batchtransform')
            setDemoOption('import_with_realtimeinference')
    }
    else {
        if(demoOption !== 'sample' && demoOption !== 'local')
            setDemoOption('sample')
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
                        console.log(response.data.payload)
                        setOriginImageItems(response.data.payload);
                        setImageCount(response.data.count);
                        setLoading(false);
                    }
                )
            }
            else
                setLoading(false);
        }
    },[imagePage, industrialModel]);

    useEffect(() => {
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
    },[industrialModel.id]);



    const onOriginImageClick = (src) => {
        setImagePreviewSrc(src)
        setVisibleOriginImagePreview(true)
    }

    const onSearchImageClick = (src) => {
        setImageSearchResultSrc(src)
        setVisibileSearchResultPreview(true)
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
        else if(id === 'formFieldIdEndpoint')
            setSelectedEndpoint({label: event.target.value, value: event.target.value})
    }

    const onImportSamples = () => {
        setVisibleImportImage(true)
    }

    useEffect(() => {
        if(task === 'search') {
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
        }
        else
            return () => {};
      }, [industrialModel, imageCount, task]);
      
    
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
                        task === 'search' &&
                        <div>
                            <div style={{display: "inline-block", float: "right", marginRight: "5px", marginTop: "-32px"}}>
                            <Button 
                                onClick={onImportSamples} 
                            >
                                {t('industrial_models.demo.import_images')}
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
                    {
                        task === 'search' && 
                        <ProgressBar value={importedCount} label={t('industrial_models.demo.import_progress')}/>
                    }
                </Container>
            )
    }

    const onFileChange = (file: File) => {
        if(task === 'search') {
            axios.post('/_image', file)
                .then((response) => {
                    var file_name : string = response.data;
                    setSearchImage(file_name);
                    setSearchImageItems([]);
                    setCurSearchImageItem('');
                    setVisibleSearchImage(false);
                    setVisibleSearchImagePreview(true)
                }, (error) => {
                    if(error.response.status === 400)
                        logOutput('error', t('industrial_models.demo.file_size_over_6M'), undefined, error);
                    else
                        logOutput('error', error.response.data, undefined, error);
                });
        }
        else {
            setOriginImageName(file.name)
            axios.post('/_image', file)
            .then((response) => {
                var filename : string = response.data;
                setCurOriginImageItem(filename);
                setVisibleOriginImagePreview(true);
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
            });            
        }
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
        if(task === 'search') {
            var imageItem = originImageItems.find((item) => {
                    return item.httpuri.substring(0, item.httpuri.indexOf('?')) === imagePreviewSrc.substring(0, imagePreviewSrc.indexOf('?'))
                }
            )
            var imageBucket = imageItem.bucket
            var imageKey = imageItem.key
            var imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))

            return (
                <ImageAnnotate
                    imageUris = {[imagePreviewSrc]} 
                    imageLabels = {[]}
                    imageColors = {[]} 
                    imageBuckets = {[imageBucket]} 
                    imageKeys = {[imageKey]}
                    imageNames = {[imageName]}
                    projectName = {industrialModel.name}
                    type = {ProjectType.IMAGE_GENERIC}
                    subType = {ProjectSubType.IMAGE_EMPTY}
                    onClosed = {() => {setVisibleOriginImagePreview(false)}}
                    activeIndex = {0}
                />
            )
        }
        else {
            if(task === 'search') {
                imageItem = originImageItems.find((item) => item.httpuri === imagePreviewSrc)
                imageBucket = imageItem.bucket
                imageKey = imageItem.key
                imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))
    
                return (
                    <ImageAnnotate
                        imageUris = {[imagePreviewSrc]} 
                        imageLabels = {[]}
                        imageColors = {[]} 
                        imageBuckets = {[imageBucket]} 
                        imageKeys = {[imageKey]}
                        imageNames = {[imageName]}
                        projectName = {industrialModel.name}
                        type = {ProjectType.IMAGE_GENERIC}
                        subType = {ProjectSubType.IMAGE_CLASS}
                        onClosed = {() => {setVisibleOriginImagePreview(false)}}
                        activeIndex = {0}
                    />
                )
            }
            else{
                if(demoOption === 'sample') {
                    imageItem = originImageItems.find((item) => item.httpuri === imagePreviewSrc)
                    imageBucket = imageItem.bucket
                    imageKey = imageItem.key
                    imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))        

                    return (
                        <ImageAnnotate
                            imageUris = {[imagePreviewSrc]} 
                            imageLabels = {[]}
                            imageColors = {[]} 
                            imageBuckets = {[imageBucket]} 
                            imageKeys = {[imageKey]}
                            imageNames = {[imageName]}
                            projectName = {industrialModel.name}
                            type = {ProjectType.IMAGE_GENERIC}
                            subType = {ProjectSubType.IMAGE_CLASS}
                            onClosed = {() => {setVisibleOriginImagePreview(false)}}
                            activeIndex = {0}
                        />
                    )
                }
                else {
                    var imageUri = `/_image/${curOriginImageItem}`

                    return (
                        <ImageAnnotate
                            imageUris = {[imageUri]} 
                            imageLabels = {[]}
                            imageColors = {[]} 
                            imageId = {curOriginImageItem}
                            imageNames = {[originImageName]}
                            projectName = {industrialModel.name}
                            type = {ProjectType.IMAGE_GENERIC}
                            subType = {ProjectSubType.IMAGE_CLASS}
                            onClosed = {() => {setVisibleOriginImagePreview(false)}}
                            activeIndex = {0}
                        />
                    )
                }
            } 
        }
    }

    const renderSearchImagePreview = () => {
        var imageUri = `/_image/${searchImage}`

        return (
            <ImageAnnotate
                imageUris = {[imageUri]} 
                imageLabels = {[]}
                imageColors = {[]} 
                imageId = {curOriginImageItem}
                imageNames = {[searchImage]}
                projectName = {industrialModel.name}
                type = {ProjectType.IMAGE_GENERIC}
                subType = {ProjectSubType.IMAGE_EMPTY}
                onClosed = {() => {setVisibleSearchImagePreview(false)}}
                activeIndex = {0}
            />
        )
    }

    const renderSearchResultPreview = () => {
        var src = imageSearchResultSrc

        src = src.substring(0, src.indexOf('?'))

        var imageBucket = src.substring(8).substring(0, src.substring(8).indexOf('.s3'))
        var imageKey = src.substring(8).substring(src.substring(8).indexOf('/') + 1)
        var imageName = src.substring(src.lastIndexOf('/') + 1)

        return (
            <ImageAnnotate
                imageUris = {[imageSearchResultSrc]} 
                imageLabels = {[]}
                imageColors = {[]} 
                imageBuckets = {[imageBucket]} 
                imageKeys = {[imageKey]}
                imageNames = {[imageName]}
                projectName = {industrialModel.name}
                type = {ProjectType.IMAGE_GENERIC}
                subType = {ProjectSubType.IMAGE_EMPTY}
                onClosed = {() => {setVisibileSearchResultPreview(false)}}
                activeIndex = {0}
            />
        )        
    }

    const renderUploadImage = () => {
        if(task === 'search')
            return (
                <Container headingVariant='h4' title={t('industrial_models.demo.image_search')}>
                    <FormField controlId={uuidv4()} label={t('industrial_models.demo.select_endpoint')}>
                        <Select
                            options={endpointOptions}
                            selectedOption={selectedEndpoint}
                            onChange={(event) => onChange('formFieldIdEndpoint', event)}
                        />
                    </FormField>
                    <Inline>
                        <div className='quickstartaction'>
                            <FileUpload
                                text={t('industrial_models.common.choose_file')}
                                onChange={onFileChange}
                            />
                        </div>
                        <div className='quickstartaction'>
                            <Button variant='primary' disabled={searchImage === ''} onClick={onSearch} loading={processing}>{t('industrial_models.demo.search')}</Button>
                        </div>
                    </Inline>
                </Container>
            )
        else
            return (
                <Container headingVariant='h4' title={t('industrial_models.demo.select_local_image')}>
                    <div className='quickstartaction'>
                        <FileUpload
                            text={t('industrial_models.common.choose_file')}
                            onChange={onFileChange}
                        />
                    </div>                    
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
                                    onClick={(src) => {setCurSearchImageItem(src);onSearchImageClick(src)}}
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

    const onChangeOptions = (event, value) => {
        setDemoOption(value)
    }

    if(visibleImportImage) {
        if(demoOption === 'import_with_realtimeinference')
            return (
                <ImportImage
                    header = {t('industrial_models.demo.import_with_realtimeinference')}
                    industrialModel = {industrialModel} 
                    endpointOptions = {endpointOptions}
                    onClose = {() => {setVisibleImportImage(false)}}
                />
            )
        else
            return (
                <TransformJobForm
                    header = {t('industrial_models.demo.import_with_batchtransform')}
                    s3uri = {industrialModel.samples}
                    onClose = {() => {setVisibleImportImage(false)}}
                />
            )
    }
    else {
        return (
            <Stack>
                <Container title = {t('industrial_models.demo.demo_options')}>
                    <RadioGroup onChange={onChangeOptions}
                        items={ 
                            (task === 'search') ?
                            [
                                <RadioButton value='import_with_realtimeinference' checked={demoOption === 'import_with_realtimeinference'} >{t('industrial_models.demo.import_with_realtimeinference')}</RadioButton>,
                                <RadioButton value='import_with_batchtransform' checked={demoOption === 'import_with_batchtransform'} >{t('industrial_models.demo.import_with_batchtransform')}</RadioButton>,
                            ] :
                            [
                                <RadioButton value='sample' checked={demoOption === 'sample'} >{t('industrial_models.demo.demo_option_sample')}</RadioButton>,
                                <RadioButton value='local' checked={demoOption === 'local'} >{t('industrial_models.demo.demo_option_local')}</RadioButton>
                            ]
                        }
                    />
                    <FormField controlId={uuidv4()}>
                        <Toggle label={t('industrial_models.demo.advanced_mode')} checked={advancedMode} onChange={onAdvancedModeChange}/>
                    </FormField>
                </Container>
                { visibleOriginImagePreview && renderOriginImagePreview() }
                { task === 'search' && visibleSearchImagePreview && renderSearchImagePreview() }
                { task === 'search' && visibleSearchResultPreview && renderSearchResultPreview() }
                { demoOption !=='local' && renderOriginImageList() }
                { demoOption !=='sample' && renderUploadImage() }
                { task === 'search' && visibleSearchImage && renderSearchImageList() }
                { renderQuickStart() }
                { renderSampleCode() }
            </Stack>
        )
    }
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(GluonCVDemoForm);