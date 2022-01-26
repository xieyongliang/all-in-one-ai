import { FunctionComponent, useState } from 'react';
import FileUpload from 'aws-northstar/components/FileUpload';
import Container from 'aws-northstar/layouts/Container';
import axios from 'axios';
import URLImage from '../URLImage';
import FormField from 'aws-northstar/components/FormField'
import Inline from 'aws-northstar/layouts/Inline'
import Button from 'aws-northstar/components/Button'
import { Stack } from 'aws-northstar';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

const InferenceForm: FunctionComponent = () => {
    const [filename, setFilename] = useState('')
    const [label, setLabel] = useState<string[]>([])
    const [bbox, setBbox] = useState<string[][]>([[]])

    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFilename('/image/' + filename);
            setLabel([]);
        }, (error) => {
            console.log(error);
        });
    }

    const onClick = () => {
        axios.get('/inference' + filename)
        .then((response) => {
            var tlabel = [];
            var tbbox = [[]];
            for(let item of response.data) {
                tlabel.push(item.label)
                var numbers = item.bbox.toString().split(',');
                tbbox.push(numbers);
            }
            setLabel(tlabel);
            setBbox(tbbox);
        }, (error) => {
            console.log(error);
        });
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
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onClick}>Inference</Button>
                    </FormField>
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
                    <URLImage src={filename} label={label} bbox={bbox}/>
                </Container>
                    <FormField controlId='button'>
                        <Button variant="primary" onClick={onClick}>Inference</Button>
                    </FormField>
            </Stack>
        )
}

export default InferenceForm;