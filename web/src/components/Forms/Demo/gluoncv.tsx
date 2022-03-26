import { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Toggle, Flashbar, Select, Stack, FormField, Button, Grid } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';import axios from 'axios';
import Image from '../../Utils/Image';
import { PathParams } from '../../Interfaces/PathParams';
import Pagination from '@mui/material/Pagination';  
import '../../Utils/Image/index.scss'
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { SelectOption } from 'aws-northstar/components/Select';
import FileUpload from 'aws-northstar/components/FileUpload';
import { FileMetadata } from 'aws-northstar/components/FileUpload/types';
import ImagePreview from '../../Utils/ImagePreview';

interface IProps {
    industrialModels: IIndustrialModel[];
}

const GluonCVDemoForm: FunctionComponent<IProps> = (props) => {
    const [ originImageItems, setOriginImageItems ] = useState([])
    const [ searchImageItems, setSearchSearchItems ] = useState([])
    const [ curOriginImageItem, setCurOriginImageItem ] = useState('')
    const [ curSearchImageItem, setCurSearchImageItem ] = useState('')
    const [ curImagePreviewItem, setCurImagePreviewItem ] = useState('')
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ visibleSearchImage, setVisibleSearchImage ] = useState(false)
    const [ imagePage, setImagePage ] = useState(0)
    const [ imageCount, setImageCount ] = useState(0)
    const [ srcImagePreview, setSrcImagePreview ] = useState('')
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)
    const [ loading, setLoading ] = useState(true);

    var params : PathParams = useParams();

    const getSourceCode = async (uri) => {
        const response = await axios.get('/file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
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

    var industrialModels = props.industrialModels

    useEffect(() => {
        if(industrialModels.length > 0) {
            setLoading(true)
            var index = industrialModels.findIndex((item) => item.name === params.name)
            var s3uri = industrialModels[index].samples
            axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: 20 }})
                .then((response) => {
                    setOriginImageItems(response.data.payload);
                    setImageCount(response.data.count);
                    setLoading(false);
                }
            )
            axios.get('/endpoint', {params: { industrial_model: params.name}})
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
    },[params.name, imagePage, industrialModels]);

    const onImageClick = (src) => {
        setSrcImagePreview(src)
        setVisibleImagePreview(true)
    }
    
    const onImageClose = () => {
        setVisibleImagePreview(false);
        setSrcImagePreview('')
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
        else if(id === 'formFieldIdEndpoint')
            setSelectedEndpoint({label: event.target.value, value: event.target.value})
    }

    const renderFlashbar = () => {
        return (
            <Flashbar items={[{
                header: 'Loading sample images...',
                content: 'This may take up to an minute. Please wait a bit...',
                dismissible: true,
                loading: loading
            }]} />
        )
    }
    
    const renderOriginImageList = () => {
        return (
            <Container headingVariant='h4' title = 'Browse image file from sample list'>
                <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                    {
                        originImageItems.map((item) => (
                            <ImageListItem key={item.httpuri} rows={2}>
                                <Image
                                    src={item.httpuri}
                                    width={128}
                                    height={128}
                                    current={curOriginImageItem}
                                    onClick={(src)=> {setCurOriginImageItem(src);onImageClick(src)}}
                                />
                            </ImageListItem>
                        ))
                    }
                </ImageList>
                <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.floor(imageCount / 20) + 1} />
                <FormField controlId='formFieldIdImport'>
                    <Button> Import into Opensearch Index</Button>
                </FormField>
            </Container>
        )
    }

    const onFileChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
            .then((response) => {
                var file_name : string = response.data;
                setCurImagePreviewItem(file_name);
                setSearchSearchItems([])
                setCurSearchImageItem('');
                setVisibleSearchImage(false);
            }, (error) => {
                console.log(error);
            });
    }

    const onSearch = () => {
        axios.get('/search/image', { params: {endpoint_name: selectedEndpoint.value, file_name: curImagePreviewItem}})
            .then((response) => {
                setSearchSearchItems(response.data);
                setVisibleSearchImage(true);
            }, (error) => {
                console.log(error);
            });
    }

    const renderImagePreview = () => {
        return (
            <ImagePreview src={srcImagePreview} width={"100%"} height={"100%"} visible={visibleImagePreview} onClose={onImageClose}/>
        )
    }

    const renderUploadImage = () => {
        if(curImagePreviewItem === '') 
            return (
                <Container headingVariant='h4' title='Select image file from local disk and Preview'>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                        <FileUpload
                            controlId='fileImage'
                            onChange={onFileChange}
                        />
                        </Grid>
                        <Grid item xs={4}>
                            <FormField controlId='formFieldIdChooseEndpoint'>
                                <Select
                                    placeholder='Choose endpoint'
                                    options={endpointOptions}
                                    selectedOption={selectedEndpoint}
                                    onChange={(event) => onChange('formFieldIdEndpoint', event)}
                                />
                            </FormField>
                        </Grid>
                        <Grid item xs={4}>
                            <FormField controlId='formFieldIdSearch'>
                                <Button variant='primary' disabled={curImagePreviewItem === ''} onClick={onSearch}>Search by image</Button>
                            </FormField>
                        </Grid>
                    </Grid>
                </Container>
            )
        else 
            return (
                <Container headingVariant='h4' title='Select image file from local disk and Preview'>
                    <Grid container spacing={3}>
                        <Grid item xs={4}>
                        <FileUpload
                            controlId='fileImage'
                            onChange={onFileChange}
                        />
                        </Grid>
                        <Grid item xs={4}>
                            <FormField controlId='formFieldIdChooseEndpoint'>
                                <Select
                                    placeholder='Choose endpoint'
                                    options={endpointOptions}
                                    selectedOption={selectedEndpoint}
                                    onChange={(event) => onChange('formFieldIdEndpoint', event)}
                                />
                            </FormField>
                        </Grid>
                        <Grid item xs={4}>
                            <FormField controlId='formFieldIdSearchByImage'>
                                <Button variant='primary' disabled={curImagePreviewItem === ''} onClick={onSearch}>Search by image</Button>
                            </FormField>
                        </Grid>
                        <Grid item xs={12}>
                            <Image src={'/image/' + curImagePreviewItem} width={"100%"} height={"100%"} current=''/>
                        </Grid>
                    </Grid>
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
                                    src={item}
                                    width={128}
                                    height={128}
                                    current={curSearchImageItem}
                                    onClick={(src) => {setCurSearchImageItem(src);onImageClick(src)}}
                                />
                            </ImageListItem>
                        ))
                    }
                </ImageList>
                <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.floor(searchImageItems.length / 20) + 1} />
            </Container>
        )
    }

    const renderSampleCode = () => {
        return (
            <Container title = 'Sample code'>
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
            { loading && renderFlashbar() }
            { renderImagePreview() }
            { renderOriginImageList() }
            { renderUploadImage() }
            { visibleSearchImage && renderSearchImageList() }
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