import { FunctionComponent } from 'react';
import FileUpload from 'aws-northstar/components/FileUpload';
import Container from 'aws-northstar/layouts/Container';
import axios from 'axios';

interface FileMetadata {
    name: string;
    type?: string;
    size?: number;
    lastModified?: number;
}

const InferencePage: FunctionComponent = () => {
    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
          .then((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });
    }

return (
    <Container title="Select image file from local disk">
        <FileUpload
            controlId="file1"
            onChange={onChange}
        ></FileUpload>
    </Container>)
}

export default InferencePage;