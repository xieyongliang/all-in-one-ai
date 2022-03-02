import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Link, FormField, Inline, Stack, Toggle } from 'aws-northstar';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSZip from 'jszip';import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import ImageAnnotate from '../../Utils/Annotate';
import Image from '../../Utils/Image';
import {LABELS, COLORS, CaseType} from '../../Data/data';
import { PathParams } from '../../Interfaces/PathParams';
import '../../Utils/Image/index.scss'

const SampleForm: FunctionComponent = () => {
    const [ items, setItems ] = useState<string[]>([])
    const [ current, setCurrent ] = useState('')
    const [ filename, setFilename ] = useState('')
    const [ id, setId ] = useState<number[]>([])
    const [ bbox, setBbox ] = useState<number[][]>([])
    const [ visibleAnnotate, setVisibleAnnotate ] = useState(false);
    const [ labels, setLabels ] = useState([])
    const [ sampleCode, setSampleCode ] = useState('')
    const [ sampleConsole, setSampleConsole ] = useState('')
    const [ visibleSampleCode, setVisibleSampleCode ] = useState(false)
    const casename = useRef('');

    var params : PathParams = useParams();

    useEffect(() => {
        casename.current = params.name;
        const request1 = axios.get('/samples/' + params.name);
        const request2 = axios.get('/function/all_in_one_ai_invoke_endpoint?action=code');
        const request3 = axios.get('/function/all_in_one_ai_invoke_endpoint?action=console');
        axios.all([request1, request2, request3])
        .then(axios.spread(function(response1, response2, response3) {
            var items : string[] = []
            for(let item of response1.data) {
                items.push(item)
                setItems(items);
                setFilename('');
                setVisibleAnnotate(false);
                if(params.name === 'track')
                    setLabels(LABELS[CaseType.TRACK])
                else if(params.name === 'mask')
                    setLabels(LABELS[CaseType.FACE])    
            }
            axios.get('/file/download', {params: {uri: encodeURIComponent(response2.data)}, responseType: 'blob'})
            .then((response4) => {
                var zip = new JSZip();
                zip.loadAsync(response4.data).then(async function(zipped) {
                        zipped.file('lambda_function.py').async('string').then(function(data) {
                        setSampleCode(data)
                    })
                })
            });
            setSampleConsole(response3.data)
        }));
    },[params.name]);

    const onImageClick = (src) => {
        const filename = src.substring(src.lastIndexOf('/') + 1)
        setCurrent(src)
        setFilename(filename)
        setId([]);
        setBbox([]);
    }

    const onInference = () => {
        axios.get('/inference/sample/' + params.name + '/' + filename)
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
        console.log(current)
        return (
            <Container title = "Image annotation">
                <ImageAnnotate imageUri={current} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant="primary" onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }
    
    const renderImageList = () => {
        return (
            <Container title = "Select image file from sample list">
                <ImageList cols={12} rowHeight={64} gap={10} variant={'quilted'} style={{"height":"550px"}}>
                    {items.map((item, index) => (
                        <ImageListItem key={item} rows={2}>
                            <Image
                                src={item}
                                width={128}
                                height={128}
                                current={current}
                                onClick={onImageClick}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </Container>
        )
    }

    const renderPreview = () => {
        if(filename === '')
            return (
                <Container title = "Preview">
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onInference} disabled={filename === ''}>Inference</Button>
                    </FormField>
                </Container>
            )
        else
            return (
                <Container title = "Preview">
                    <FormField controlId='button'>
                        <div className='watermarked'>
                            <URLImage src={current} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
                        </div>
                    </FormField>
                    <Inline>
                        <FormField controlId='button'>
                            <Button variant="primary" onClick={onInference} disabled={filename === ''}>Inference</Button>
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
            <Container title = "Sample code">
                <Toggle label={visibleSampleCode ? "Show sample code" : "Hide sample code"} checked={visibleSampleCode} onChange={(checked) => {setVisibleSampleCode(checked)}} />
                <Link href={sampleConsole}>Open in AWS Lambda console</Link>
                {
                    visibleSampleCode && <SyntaxHighlighter language="python" style={github} showLineNumbers={true}>
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
                {renderImageList()}
                {renderPreview()}
                {renderSampleCode()}
            </Stack>
        )
}

export default SampleForm;