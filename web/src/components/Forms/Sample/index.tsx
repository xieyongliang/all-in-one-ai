import { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Link, FormField, Inline, Toggle, Flashbar, FormSection, Select, Stack } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import Image from '../../Utils/Image';
import { COLORS } from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import Pagination from '@mui/material/Pagination';  
import '../../Utils/Image/index.scss'
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { SelectOption } from 'aws-northstar/components/Select';

interface IProps {
    industrialModels: IIndustrialModel[];
}

const SampleForm: FunctionComponent<IProps> = (props) => {
    const [ imageItems, setImageItems ] = useState([])
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ imageIds, setImageIds ] = useState<number[]>([])
    const [ imageBboxs, setImageBboxs ] = useState<number[][]>([])
    const [ visibleAnnotate, setVisibleAnnotate ] = useState(false);
    const [ imageLabels, setImageLabels ] = useState([])
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ imagePage, setImagePage ] = useState(0)
    const [ imageCount, setImageCount ] = useState(0)
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
            setImageLabels(industrialModels[index].labels)
            axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: 20 }})
                .then((response) => {
                    setImageItems(response.data.payload);
                    setImageCount(response.data.count);
                    setVisibleAnnotate(false);
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
        setCurImageItem(src)
        setImageIds([]);
        setImageBboxs([]);
    }

    const onInference = () => {
        var index = imageItems.findIndex((item) => item.httpuri === curImageItem)
        if(index === -1)
            return;
        axios.get('/inference/sample', { params : {industrial_model: params.name, endpoint_name: selectedEndpoint.value, bucket: imageItems[index].bucket, key: imageItems[index].key}})
        .then((response) => {
            var tbbox : number[][] = [];
            var tid = [];
            for(let item of response.data) {
                var numbers = item.split(' ');
                tid.push(parseInt(item[0]));
                var box : number[] = [];
                box.push(parseFloat(numbers[1]));
                box.push(parseFloat(numbers[2]));
                box.push(parseFloat(numbers[3]));
                box.push(parseFloat(numbers[4]));
                tbbox.push(box);
            }
            setImageIds(tid);
            setImageBboxs(tbbox);
        }, (error) => {
            console.log(error);
        });
    }
    
    const onAnnotate = () => {
        setVisibleAnnotate(true);
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

    const renderAnnotate = () => {
        var annotationData : string[] = [];
        var index = 0;
        imageBboxs.forEach(item => {
            var annotation : string = imageIds[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
            annotationData.push(annotation);
            index++;
        });
        var labelsData : string[] = [];
        imageLabels.forEach(label => {
            labelsData.push(label + '\r');
        })
        return (
            <Container title = 'Image annotation'>
                <ImageAnnotate imageUri={curImageItem} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant='primary' onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }
    
    const renderImageList = () => {
        return (
            <Container title = 'Select image file from sample list'>
                <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                    {
                        imageItems.map((item) => (
                            <ImageListItem key={item.httpuri} rows={2}>
                                <Image
                                    src={item.httpuri}
                                    width={128}
                                    height={128}
                                    current={curImageItem}
                                    onClick={onImageClick}
                                />
                            </ImageListItem>
                        ))
                    }
                </ImageList>
                <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.floor(imageCount / 20)} />
            </Container>
        )
    }

    const renderEndpointOptions = () => {
        return (
            <FormSection header='Endpoint configuration'>
                <Select
                    placeholder='Choose an option'
                    options={endpointOptions}
                    selectedOption={selectedEndpoint}
                    onChange={(event) => onChange('formFieldIdEndpoint', event)}
                />
            </FormSection>
        )
    }

    const renderPreview = () => {
        if(curImageItem === '')
            return (
                <Container title = 'Preview'>
                    <FormField controlId='button'>
                        <Button variant='primary' onClick={onInference} disabled={curImageItem === ''}>Inference</Button>
                    </FormField>
                </Container>
            )
        else
            return (
                <Container title = 'Preview'>
                    <FormField controlId='button'>
                        <div className='watermarked'>
                            <URLImage src={curImageItem} colors={COLORS} labels={imageLabels} id={imageIds} bbox={imageBboxs}/>
                        </div>
                    </FormField>
                    <Inline>
                        <FormField controlId='button'>
                            <Button variant='primary' onClick={onInference} disabled={curImageItem === ''}>Inference</Button>
                        </FormField>
                        <FormField controlId='button'>
                            <Button onClick={onAnnotate} disabled={imageBboxs.length === 0}>Annotate</Button>
                        </FormField>
                    </Inline>
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

    if(visibleAnnotate)
        return renderAnnotate();
    else
        return (
            <Stack>
                { loading && renderFlashbar() }
                { renderImageList() }
                { renderEndpointOptions() }
                { renderPreview() }
                { renderSampleCode() }
            </Stack>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(SampleForm);