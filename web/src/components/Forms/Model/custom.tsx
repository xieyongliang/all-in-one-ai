import { Container, FormField, FormSection, Input, Select, Stack, Textarea, Wizard } from "aws-northstar";
import { FunctionComponent, useState } from "react";
import FileUpload from 'aws-northstar/components/FileUpload';
import axios from "axios";
import { FileMetadata } from "aws-northstar/components/FileUpload/types";
import Image from "../../Utils/Image";
import TrainingJobForm from '../TrainingJob';
import { BrowserRouter } from "react-router-dom";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CustomForm: FunctionComponent = () => {
    const optionsAlgorithm = [{label: 'Yolov5', value: 'Yolov5'}]
    const selectedAlgorithm = {label: 'Yolov5', value: 'Yolov5'}
    const [ filename, setFilename ] = useState('')
    const sampeleClassDefinition = 
    `
    train: /opt/ml/input/data/images/train/
    val: /opt/ml/input/data/images/val/

    # number of classes
    nc: 2

    # class names
    names: ['face mask', 'No face mask']
    `
    
    const onChange = (files: (File | FileMetadata)[]) => {
        axios.post('/ico', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFilename(filename);
        }, (error) => {
            console.log(error);
        });
    }

    const renderPreview = () => {
        if(filename === '') 
            return (
                <Container title='Select an icon for your industrial model'>
                    <FileUpload
                        controlId='fileImage'
                        onChange={onChange}
                    />
                </Container>
            )
        else 
            return (
                <Stack>
                    <Container title='Select an icon for your industrial model'>
                        <FileUpload
                            controlId='fileImage'
                            onChange={onChange}
                        />
                        <FormField controlId='button'>
                            <Image src={`/${filename}.jpg`} width={128} height={128} current={""} public={true}/>
                        </FormField>          
                    </Container>
                </Stack> 
            )
    }

    const renderSample = () => {
        return (
            <SyntaxHighlighter language='yaml' style={github} showLineNumbers={true}>
                {sampeleClassDefinition}
            </SyntaxHighlighter>
        )
    }

    const renderClassDefinition = () => {
        return (
            <Stack>
                <FormField label="Paste your model class definition here" controlId="formFieldIdSampleDefinition">
                    <Textarea />        
                </FormField>
                <FormField label="Sample class definition" controlId="formFieldIdSampleDefinition">
                    { renderSample() }
                </FormField>
            </Stack>    
        )
    }

    const renderCustomSetting = () => {
        return (
            <FormSection header="Industrial model settings" >
                <FormField label="Industrial model name" controlId="formFieldIdModelName">
                    <Input type="text" />
                </FormField>
                <FormField label="Industrial model algorithm" controlId="formFieldIdModelType">
                    <Select
                        placeholder='Choose an option'
                        options={optionsAlgorithm}
                        selectedOption={selectedAlgorithm}
                    />
                </FormField>
            </FormSection>
        )
    }

    const renderCustom = () => {
        return (
            <Container>
                { renderCustomSetting() }
                { renderPreview() }
                { renderClassDefinition() }
            </Container>
        )
    }

    const steps = [
        {
            title: 'Industrial model',
            content: 
                renderCustom()
        },
        {
            title: 'Training job',
            content: 
                <TrainingJobForm wizard={true}/>
        }
    ]

    const onSubmit = () => {

    }

    const onCancel = () => {

    }
    
    return (
        <BrowserRouter>
            <Container>
                <Wizard steps={steps} onSubmitButtonClick={onSubmit} onCancelButtonClick={onCancel}/>
            </Container>
        </BrowserRouter>
    )
}

export default CustomForm;