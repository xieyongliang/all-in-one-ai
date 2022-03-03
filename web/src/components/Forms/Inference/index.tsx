import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, FormField, Button, Inline, Stack, Toggle, Link } from 'aws-northstar';
import FileUpload from 'aws-northstar/components/FileUpload';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';
import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import {LABELS, COLORS, CaseType} from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

const InferenceForm: FunctionComponent = () => {
    const [filename, setFilename] = useState('')
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    const [visibleAnnotate, setVisibleAnnotate] = useState(false);
    const [labels, setLabels] = useState([]);
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const casename = useRef('');

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        setFilename('');
        setVisibleAnnotate(false)
        if(params.name === 'track')
            setLabels(LABELS[CaseType.TRACK])
        else if(params.name === 'mask')
            setLabels(LABELS[CaseType.FACE])

        const request1 = axios.get('/function/all_in_one_ai_invoke_endpoint?action=code');
        const request2 = axios.get('/function/all_in_one_ai_invoke_endpoint?action=console');
        axios.all([request1, request2])
        .then(axios.spread(function(response1, response2) {
            axios.get('/file/download', {params: {uri: encodeURIComponent(response1.data)}, responseType: 'blob'})
            .then((response4) => {
                var zip = new JSZip();
                zip.loadAsync(response4.data).then(async function(zipped) {
                        zipped.file('lambda_function.py').async('string').then(function(data) {
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response2.data);
        }));
    }, [params.name]);

    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFilename(filename);
            setId([]);
            setBbox([]);
        }, (error) => {
            console.log(error);
        });
    }

    const onInference = () => {
        axios.get('/inference/image/' + params.name + '/' + filename)
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
            setId(tid);
            setBbox(tbbox);
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
        bbox.forEach(item => {
            var annotation : string = id[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
            annotationData.push(annotation);
            index++;
        });
        var labelsData : string[] = [];
        labels.forEach(label => {
            labelsData.push(label + '\r');
        })
            
        return (
            <Container title = 'Image annotation'>
                <ImageAnnotate imageUri={`/image/${filename}`} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant='primary' onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }

    const renderImageDownload = () => {
        return (
            <Container title='Select image file from local disk'>
                <FileUpload
                    controlId='fileImage'
                    onChange={onChange}
                ></FileUpload>
            </Container>
        )
    }

    const renderPreview = () => {
        if(filename === '') 
            return (
                <Container title='Preview'>
                    <FormField controlId='button'>
                        <Button variant='primary' onClick={onInference} disabled={filename === ''}>Inference</Button>
                    </FormField>
                </Container>
            )
        else 
            return (
                <Container title='Preview'>
                    <FormField controlId='button'>
                        <URLImage src={'/image/' + filename} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
                    </FormField>          
                    <Inline>      
                        <FormField controlId='button'>
                            <Button variant='primary' onClick={onInference} disabled={filename === ''}>Inference</Button>
                        </FormField>
                        <FormField controlId='button'>
                                <Button onClick={onAnnotate} disabled={bbox.length === 0}>Annotate</Button>
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
                {renderImageDownload()}
                {renderPreview()}
                {renderSampleCode()}
            </Stack>
        )
}

export default InferenceForm;