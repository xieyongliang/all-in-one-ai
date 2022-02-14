import { FunctionComponent, useState } from 'react';
import FileUpload from 'aws-northstar/components/FileUpload';
import Container from 'aws-northstar/layouts/Container';
import axios from 'axios';
import URLImage from '../../Utils/URLImage';
import FormField from 'aws-northstar/components/FormField'
import Button from 'aws-northstar/components/Button'
import { Inline, Stack } from 'aws-northstar';
import ImageAnnotate from '../../Utils/Annotate';
import { threadId } from 'worker_threads';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

const InferenceForm: FunctionComponent = () => {
    const [filename, setFilename] = useState('')
    const [visible, setVisible] = useState(false);
    const [id, setId] = useState<number[]>([])
    const [bbox, setBbox] = useState<number[][]>([])
    var labels = ['squat', 'aluminothermic weld (atw)', 'tri metal weld (tmw)', 'fishplate joint (fj)', 'grinding marks', 'head check error', 'insulated rail joint (irj)', 'flash butt weld (fbw)', 'corrugation', 'rail head anomaly']

    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFilename('/image/' + filename);
            setId([]);
            setBbox([]);
        }, (error) => {
            console.log(error);
        });
    }

    const onInference = () => {
        axios.get('/inference' + filename)
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
        setVisible(true);
    }

    if(visible) {
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
                <ImageAnnotate imageUri={filename} labelsData={labelsData} annotationData={annotationData}/>
                <FormField controlId='button'>
                    <Button variant="primary" onClick={()=>setVisible(false)}>Close</Button>
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
                        <Button variant="primary" onClick={onInference}>Inference</Button>
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
                <Container title="Start inference">
                    <FormField controlId='button'>
                        <URLImage src={filename} labels={labels} id={id} bbox={bbox}/>
                    </FormField>          
                    <Inline>      
                        <FormField controlId='button'>
                            <Button variant="primary" onClick={onInference}>Inference</Button>
                        </FormField>
                        <FormField controlId='button'>
                                <Button onClick={onAnnotate}>Annotate</Button>
                        </FormField>
                    </Inline>
                </Container>
            </Stack>
        )
}

export default InferenceForm;