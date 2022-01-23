import { FunctionComponent } from 'react';
import FileUpload from 'aws-northstar/components/FileUpload';
import Container from 'aws-northstar/layouts/Container';

const InferencePage: FunctionComponent = () => {
return (
    <Container title="Upload Image file to inference">
        <FileUpload
            controlId="file1"
            label="Form field label"
            description="Only jpg/png/jpeg image files are allowed"
            onChange={console.log}
        ></FileUpload>
    </Container>)
}

export default InferencePage;