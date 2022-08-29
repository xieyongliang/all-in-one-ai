import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Container, Stack, Toggle, Link, Inline, Button } from 'aws-northstar';
import FileUpload from 'aws-northstar/components/FileUpload';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import ImageAnnotate from '../../Utils/ImageAnnotate';
import { COLORS } from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { v4 as uuidv4 } from 'uuid';
import './index.scss'

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

interface IProps {
    industrialModels: IIndustrialModel[];
    type: ProjectType;
    subType?: ProjectSubType;
}

const LocalImageForm: FunctionComponent<IProps> = (props) => {
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ imageLabels, setImageLabels ] = useState([]);
    const [ imageName, setImageName ] = useState('')
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
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
            var index = industrialModels.findIndex((item) => item.id === params.id)
            setImageLabels(industrialModels[index].labels)
            setCurImageItem('');
            setVisibleImagePreview(false)
        }
    }, [params.id, industrialModels]);

    const onFileChange = (files: (File | FileMetadata)[]) => {
        setImageName(files[0].name.substring(0, files[0].name.lastIndexOf('.')))
        axios.post('/_image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setCurImageItem(filename);
            setVisibleImagePreview(true)
        }, (error) => {
            console.log(error);
        });
    }

    const onImageClose = () => {
        setVisibleImagePreview(false);
    }

    const renderImagePreview = () => {
        var imageUri = `/_image/${curImageItem}`

        var labelsData : string[] = [];
        imageLabels.forEach(label => {
            labelsData.push(label + '\n');
        })

        var industrialModel = industrialModels.find((item) => item.id === params.id)

        return (
            <ImageAnnotate 
                imageUris = {[imageUri]} 
                imageLabels = {labelsData} 
                imageColors = {COLORS} 
                imageId = { curImageItem } 
                imageNames = {[imageName]}
                projectName = {industrialModel.name}
                type = {props.type}
                subType = {props.subType}
                onClosed = {onImageClose}
                activeIndex = {0}
            />
        )
    }

    const renderImageUpload = () => {
        return (
            <Container title='Select local image'>
                <FileUpload
                    controlId={uuidv4()}
                    onChange={onFileChange}
                ></FileUpload>
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
                {renderImageUpload()}
                { renderQuickStart() }
                {renderSampleCode()}
            </Stack>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(LocalImageForm);