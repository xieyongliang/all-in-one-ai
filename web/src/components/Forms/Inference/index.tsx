import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, FormField, Button, Inline, Stack } from 'aws-northstar';
import FileUpload from 'aws-northstar/components/FileUpload';
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

interface InferenceFormProp {
    name: string;
}

const InferenceForm: FunctionComponent = () => {
    const [filename, setFilename] = useState('')
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    const [visibleAnnotate, setVisibleAnnotate] = useState(false);
    const [labels, setLabels] = useState([]);
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

    if(visibleAnnotate) {
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
            <Container title = "Image annotation">
                <ImageAnnotate imageUri={window.location.protocol + '//' + window.location.host + '/image/' + filename} labelsData={labelsData} annotationData={annotationData} colorData={COLORS}/>
                <FormField controlId='button'>
                    <Button variant="primary" onClick={()=>setVisibleAnnotate(false)}>Close</Button>
                </FormField>
            </Container>
        )
    }

    if(filename === '')
        return (
            <Stack>
                <Container title="Select image file from local disk">
                    <FileUpload
                        controlId="file1"
                        onChange={onChange}
                    ></FileUpload>
                </Container>
                <Container title="Start inference">
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onInference} disabled={filename === ''}>Inference</Button>
                    </FormField>
                </Container>
            </Stack>
        )
    else
        return (
            <Stack>
                <Container title="Select image file from local disk">
                    <FileUpload
                        controlId="file1"
                        onChange={onChange}
                    ></FileUpload>
                </Container>
                <Container title="Preview">
                    <FormField controlId='button'>
                        <URLImage src={'/image/' + filename} colors={COLORS} labels={labels} id={id} bbox={bbox}/>
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
            </Stack>
        )
}

export default InferenceForm;