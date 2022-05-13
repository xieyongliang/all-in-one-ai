import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Container, Link, Toggle, Stack, LoadingIndicator, Inline, Button } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';import axios from 'axios';
import ImageAnnotate from '../../Utils/ImageAnnotate';
import Image from '../../Utils/Image';
import { COLORS } from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import Pagination from '@mui/material/Pagination';  
import '../../Utils/Image/index.scss'
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import './index.scss'

interface IProps {
    type: ProjectType;
    subType?: ProjectSubType;
    industrialModels: IIndustrialModel[];
}

const SampleForm: FunctionComponent<IProps> = (props) => {
    const [ imageItems, setImageItems ] = useState([])
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ imageLabels, setImageLabels ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ imagePage, setImagePage ] = useState(1)
    const [ imageCount, setImageCount ] = useState(0)
    const [ loading, setLoading ] = useState(true);
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)
    const history = useHistory();
    
    var params : PathParams = useParams();

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

    var industrialModels = props.industrialModels

    useEffect(() => {
        if(industrialModels.length > 0) {
            setLoading(true)
            var index = industrialModels.findIndex((item) => item.id === params.id)
            var s3uri = industrialModels[index].samples
            setImageLabels(industrialModels[index].labels)
            axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: 20 }})
                .then((response) => {
                    setImageItems(response.data.payload);
                    setImageCount(response.data.count);
                    setLoading(false);
                }
            )
        }
    },[params.id, imagePage, industrialModels]);

    const onImageClick = (src) => {
        setCurImageItem(src)
        setVisibleImagePreview(true)
    }

    const onImageClose = () => {
        setVisibleImagePreview(false);
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
    }

    const renderImagePreview = () => {
        
        var imageItem = imageItems.find((item) => item.httpuri === curImageItem)

        var imageBucket = imageItem.bucket
        var imageKey = imageItem.key

        var labelsData : string[] = [];
        imageLabels.forEach(label => {
            labelsData.push(label + '\r');
        })

        var imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))

        return (
            <ImageAnnotate 
                imageUri = {curImageItem} 
                imageLabels = {labelsData} 
                imageColors = {COLORS} 
                imageBucket = {imageBucket} 
                imageKey = {imageKey}
                imageName = {imageName}
                type = {props.type}
                subType = {props.subType}
                visible = {visibleImagePreview} 
                onClose = {onImageClose}
            />
        )
    }
    
    const renderImageList = () => {
        if(loading)
            return (
                <Container title = 'Select image file from sample list'>
                    <LoadingIndicator label='Loading...'/>
                </Container>
            )
        else {
            return (
                <Container title = 'Select image file from sample list'>
                    <ImageList cols={10} rowHeight={64} gap={10} variant={'quilted'}>
                        {
                            imageItems.length > 0 && 
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
                    <Pagination page={imagePage} onChange={(event, value) => onChange('formFieldIdPage', value)} count={Math.ceil(imageCount / 20)} />
                </Container>
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

    if(visibleImagePreview)
        return (
            <Stack>
                { renderImagePreview() }
                { renderQuickStart() }
            </Stack>
        )
    else
        return (
            <Stack>
                { renderImageList() }
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
)(SampleForm);