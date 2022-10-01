import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Container, Link, Toggle, Stack, LoadingIndicator, Inline, Button, FormField, Select } from 'aws-northstar';
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
import { ALGORITHMS } from '../../Data/data';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import './index.scss'
import { SelectOption } from 'aws-northstar/components/Select';
import { logOutput } from '../../Utils/Helper';

interface IProps {
    type: ProjectType;
    subType?: ProjectSubType;
    industrialModels: IIndustrialModel[];
}

const SampleImageForm: FunctionComponent<IProps> = (props) => {
    const [ imageItems, setImageItems ] = useState([])
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ imageLabels, setImageLabels ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const [ imagePage, setImagePage ] = useState(1)
    const [ imageCount, setImageCount ] = useState(0)
    const [ loading, setLoading ] = useState(false);
    const [ visibleImagePreview, setVisibleImagePreview ] = useState(false)
    const [ selectedSampleFunction, setSelectedSampleFunction ] = useState<SelectOption>({})

    const train_framework = 'pytorch';
    const deploy_framework = 'pytorch';

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
    var industrialModels = props.industrialModels
    var industrialModel = industrialModels.find((item) => item.id === params.id);
    var algorithm = industrialModel.algorithm;
    var trainable = ALGORITHMS.find((item) => item.value === algorithm)

    const getSourceCode = async (uri) => {
        const response = await axios.get('/_file/download', {params: {uri: encodeURIComponent(uri)}, responseType: 'blob'})
        return response.data
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
        if(industrialModels.length > 0) {
            var index = industrialModels.findIndex((item) => item.id === params.id)
            var s3uri = industrialModels[index].samples
            var imageLabels = JSON.parse(industrialModels[index].extra).labels
            if(imageLabels !== undefined)
                setImageLabels(imageLabels)
            if(s3uri !== '') {
                setLoading(true)
                axios.get('/s3', {params : { s3uri : s3uri, page_num: imagePage, page_size: 20, include_filter: 'jpg,jpeg,png' }})
                    .then((response) => {
                        setImageItems(response.data.payload);
                        setImageCount(response.data.count);
                        setLoading(false);
                    }, (error) => {
                        logOutput('error', error.response.data, undefined, error);
                        setLoading(false);
                    }
                );
            }
        }
    },[params.id, imagePage, industrialModels]);

    const onImageClick = (httpuri) => {
        setCurImageItem(httpuri)
        setVisibleImagePreview(true)
    }

    const onImageClose = () => {
        setVisibleImagePreview(false);
    }

    const onChange = (id, event) => {
        if(id === 'formFieldIdPage')
            setImagePage(event)
        if(id === 'formFieldIdSampleFunction') {
            setSelectedSampleFunction({label: event.target.value, value: event.target.value})
        }
    }

    const renderImagePreview = () => {
        
        var imageItem = imageItems.find((item) => item.httpuri === curImageItem)

        var imageBucket = imageItem.bucket
        var imageKey = imageItem.key

        var labelsData : string[] = [];
        imageLabels.forEach(label => {
            labelsData.push(label + '\n');
        })

        var imageName = imageKey.substring(imageKey.lastIndexOf('/') + 1, imageKey.lastIndexOf('.'))

        return (
            <ImageAnnotate 
                imageUris = {[curImageItem]} 
                imageLabels = {labelsData} 
                imageColors = {COLORS} 
                imageBuckets = {[imageBucket]} 
                imageKeys = {[imageKey]}
                imageNames = {[imageName]}
                projectName = {industrialModel.name}
                type = {props.type}
                subType = {props.subType}
                onClosed = {onImageClose}
                activeIndex = {0}
            />
        )
    }
    
    const renderImageList = () => {
        if(loading)
            return (
                <Container title = {t('industrial_models.demo.sample_data')}>
                    <LoadingIndicator label={t('industrial_models.demo.loading')}/>
                </Container>
            )
        else {
            return (
                <Container title = {t('industrial_models.demo.sample_data')}>
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
                </Container>
            )
        }
    }

    const onStartBatchAnnotation = () => {
        var s3uri =  industrialModel.samples;
        var extra = industrialModel.extra
        var projectName = industrialModel.name;
        var subType : ProjectSubType;
        if (props.subType === ProjectSubType.OBJECT_DETECTION)
            subType = ProjectSubType.BATCH_LABEL 
        else if(props.subType === ProjectSubType.IMAGE_RANK_TEXT)
            subType = ProjectSubType.BATCH_RANK_TEXT
        else if(props.subType === ProjectSubType.IMAGE_RANK_FLOAT)
            subType = ProjectSubType.BATCH_RANK_FLOAT
        else
            subType = ProjectSubType.BATCH_RANK_CLASS
        
        var data = JSON.stringify({s3uri: s3uri, extra: extra, type: props.type, subType: subType, projectName: projectName})
        history.push(`/batchannotation#${data}}`)
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
                    {
                        ((algorithm === 'yolov5') || (algorithm === 'generic') ) &&
                        <div className='quickstartaction'>
                            <Button onClick={onStartBatchAnnotation} disabled={!trainable}>{t('industrial_models.demo.batch_annotation')}</Button>
                        </div>
                    }
                    <div className='quickstartaction'>
                        <Button onClick={onStartTrain} disabled={!trainable}>{t('industrial_models.demo.train')}</Button>
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
            <Container title = {t('industrial_models.demo.sample_code')}>
                <Toggle label={visibleSampleCode ? t('industrial_models.demo.show_sample_code') : t('industrial_models.demo.hide_sample_code')} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <FormField controlId={uuidv4()}>
                    <Select
                            options={sampleFunctionOptions}
                            selectedOption={selectedSampleFunction}
                            onChange={(event) => onChange('formFieldIdSampleFunction', event)}
                        />
                </FormField>
                <Link href={sampleConsole}>{t('industrial_models.demo.open_function_in_aws_console')}</Link>
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
)(SampleImageForm);