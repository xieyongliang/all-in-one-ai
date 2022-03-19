import { Button, Container, Form, FormField, FormSection, Input, Select, Stack, Textarea, Wizard } from "aws-northstar";
import { FunctionComponent, useState } from "react";
import axios from "axios";
import FileUpload from 'aws-northstar/components/FileUpload';
import { FileMetadata } from "aws-northstar/components/FileUpload/types";
import Image from "../Utils/Image"
import { IIndustrialModel } from "../../store/pipelines/reducer";
import { AppState } from "../../store";
import { connect } from "react-redux";
import { UpdateIndustrailModels } from "../../store/pipelines/actionCreators";

interface IProps {
    updateIndustrailModelsAction : (industrialModels : IIndustrialModel[]) => any
    industrialModels: IIndustrialModel[];
}

const CustomForm: FunctionComponent<IProps> = (props) => {
    const optionsAlgorithm = [{label: 'Yolov5', value: 'yolov5'}]
    const selectedAlgorithm = {label: 'Yolov5', value: 'yolov5'}
    const [ modelName, setModelName ] = useState('')
    const [ modelDescription, setModelDescription ] = useState('')
    const [ modelSamples, setModelSamples ] = useState('')
    const [ modelLables, setModelLabels ] = useState('')
    const [ fileName, setFileName ] = useState('')
    const [ fileContent, setFileContent ] = useState(undefined)
    
    const onChange = (id, event) => {
        if(id === 'formFieldIdModelName')
            setModelName(event)
        else if(id === 'formFieldIdModelDescription')
            setModelDescription(event)
        else if(id === 'formFieldIdModelLabels')
            setModelLabels(event.target.value)
        else if(id === 'formFieldIdModelSamples')
            setModelSamples(event)
    }

    const onFileChange = (files: (File | FileMetadata)[]) => {
        axios.post('/ico', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFileName(filename);
            setFileContent(files[0])
        }, (error) => {
            console.log(error);
        });
    }

    const renderImagePreview = () => {
        if(fileName === '') 
            return (
                <Container title='Select an icon for your industrial model'>
                    <FileUpload
                        controlId='fileImage'
                        onChange={onFileChange}
                    />
                </Container>
            )
        else 
            return (
                <Stack>
                    <Container title='Select an icon for your industrial model'>
                        <FileUpload
                            controlId='fileImage'
                            onChange={onFileChange}
                        />
                        <FormField controlId='button'>
                            <Image src={`/${fileName}.jpg`} width={128} height={128} current={""} public={true}/>
                        </FormField>          
                    </Container>
                </Stack> 
            )
    }

    const renderClassDefinition = () => {
        return (
            <FormSection header="Industrial model class and samples settings" >
                <FormField label="Paste your model class definition here" controlId="formFieldIdModelLabels">
                    <Textarea value={modelLables} onChange={(event) => onChange('formFieldIdModelLabels', event)} />        
                </FormField>
                <FormField label="Paste your model class sample images s3 uri here" controlId="formFieldIdModelSamples">
                    <Input type="text" value={modelSamples} onChange={(event) => onChange('formFieldIdModelSamples', event)} />        
                </FormField>
            </FormSection>
        )
    }

    const renderModelSetting = () => {
        return (
            <FormSection header="Industrial model settings" >
                <FormField label="Industrial model name" controlId="formFieldIdModelName">
                    <Input type="text" value={modelName} onChange={(event) => onChange('formFieldIdModelName', event)}/>
                </FormField>
                <FormField label="Industrial model description" controlId="formFieldIdModelDescription">
                    <Input type="text" value={modelDescription} onChange={(event) => onChange('formFieldIdModelDescription', event)}/>
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

    const onCancel = () => {
        history.back()
    }

    const renderCustom = () => {
        return (
            <Form
            header='Create industrial model'
            description='To use an industrial model for training, deployment, and inference, please create industrial model based on supported algorithm first'
            actions={
                <div>
                    <Button variant='link' onClick={onCancel}>Cancel</Button>
                    <Button variant='primary' onClick={onSubmit}>Submit</Button>
                </div>
            }>
                { renderModelSetting() }
                { renderImagePreview() }
                { renderClassDefinition() }
            </Form>
        )
    }

    const onSubmit = () => {
        var buffer = {
            'model_name': modelName,
            'algorithm_name': selectedAlgorithm.value,
            'model_description': modelDescription,
            'model_labels': modelLables,
            'model_samples': modelSamples,
            'file_name': fileName
        }
        axios.post('/models', buffer)
        .then((response) => {
            var modelIcon = response.data
            var industrialModels = props.industrialModels.map((x) => x)
            industrialModels.push({name: modelName, algorithm : selectedAlgorithm.value, description: modelDescription, labels: modelLables.split('\n'), samples: modelSamples, icon: modelIcon})
            props.updateIndustrailModelsAction(industrialModels)
            history.back()
        }, (error) => {
                console.log(error);
            }
        ).catch((e) => {
            console.log(e)
        })
    };
    
    return (
        renderCustom()
    )
}

const mapDispatchToProps = {
    updateIndustrailModelsAction: UpdateIndustrailModels,
};

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.pipeline.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomForm);