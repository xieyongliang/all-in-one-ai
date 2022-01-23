import { FunctionComponent, useState } from 'react';
import FileUpload from 'aws-northstar/components/FileUpload';
import Container from 'aws-northstar/layouts/Container';
import axios from 'axios';
import URLImage from '../URLImage';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

const InferencePage: FunctionComponent = () => {
    const [filename, setFilename] = useState('')

    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
          .then((response) => {
            var filename : string = response.data;
            setFilename('/image/' + filename);
          }, (error) => {
            console.log(error);
          });
    }

    if(filename === '')
        return (
            <Container title="Select image file from local disk">
                <FileUpload
                    controlId="file1"
                    onChange={onChange}
                ></FileUpload>
            </Container>)
    else
        return (
            <Container title="Select image file from local disk">
                <FileUpload
                    controlId="file1"
                    onChange={onChange}
                ></FileUpload>
                <URLImage src={filename}/>
            </Container>)
}

export default InferencePage;