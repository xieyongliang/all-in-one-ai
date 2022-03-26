import { FunctionComponent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, FormField, Button, Inline, Stack, Toggle, Link } from 'aws-northstar';
import FileUpload from 'aws-northstar/components/FileUpload';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import { COLORS } from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

interface IProps {
    industrialModels: IIndustrialModel[];
}

const InferenceForm: FunctionComponent<IProps> = (props) => {
    const [ curImageItem, setCurImageItem ] = useState('')
    const [ imageIds, setImageIds ] = useState<number[]>([])
    const [ imageBboxs, setImageBboxs ] = useState<number[][]>([])
    const [ visibleAnnotate, setVisibleAnnotate ] = useState(false);
    const [ imageLabels, setImageLabels ] = useState([]);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)

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
            var index = industrialModels.findIndex((item) => item.name === params.name)
            setImageLabels(industrialModels[index].labels)
            setCurImageItem('');
            setVisibleAnnotate(false)
        }
    }, [params.name, industrialModels]);

    const onFileChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setCurImageItem(filename);
            setImageIds([]);
            setImageBboxs([]);
        }, (error) => {
            console.log(error);
        });
    }

    const onInference = () => {
        axios.get('/inference/image/' + curImageItem)
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
                <ImageAnnotate imageUri={`/image/${curImageItem}`} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant='primary' onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }

    const renderImageUpload = () => {
        return (
            <Container title='Select image file from local disk'>
                <FileUpload
                    controlId='fileImage'
                    onChange={onFileChange}
                ></FileUpload>
            </Container>
        )
    }

    const renderImagePreview = () => {
        if(curImageItem === '') 
            return (
                <Container title='Preview'>
                    <FormField controlId='button'>
                        <Button variant='primary' onClick={onInference} disabled={curImageItem === ''}>Inference</Button>
                    </FormField>
                </Container>
            )
        else 
            return (
                <Container title='Preview'>
                    <FormField controlId='button'>
                        <URLImage src={'/image/' + curImageItem} colors={COLORS} labels={imageLabels} id={imageIds} bbox={imageBboxs}/>
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
                {renderImageUpload()}
                {renderImagePreview()}
                {renderSampleCode()}
            </Stack>
        )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(InferenceForm);