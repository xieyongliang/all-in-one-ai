import { Button, Container, Form, FormField, FormSection, Input, Select, Stack, Textarea } from "aws-northstar";
import { FunctionComponent, useState } from "react";
import axios from "axios";
import FileUpload from 'aws-northstar/components/FileUpload';
import { FileMetadata } from "aws-northstar/components/FileUpload/types";
import Image from "../../Utils/Image"
import { IIndustrialModel } from "../../../store/industrialmodels/reducer";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { Updateindustrialmodels } from "../../../store/industrialmodels/actionCreators";

interface IProps {
    updateindustrialmodelsAction : (industrialModels : IIndustrialModel[]) => any
    industrialModels: IIndustrialModel[];
    onClose: () => any;
}

const IndustrialModelForm: FunctionComponent<IProps> = (props) => {
    const algorithmOptions = [{label: 'Yolov5', value: 'yolov5'}, {label: 'GluonCV', value:'gluoncv'}, {label: 'PaddleOCR', value: 'paddle'}]
    const [ selectedAlgorithm, setSelectedAlgorithm] = useState({label: 'Yolov5', value: 'yolov5'})
    const [ modelName, setModelName ] = useState('')
    const [ modelDescription, setModelDescription ] = useState('')
    const [ modelSamples, setModelSamples ] = useState('')
    const [ modelLables, setModelLabels ] = useState('')
    const [ fileName, setFileName ] = useState('')
    const [ processing, setProcessing ] = useState(false)

    const onChange = (id, event) => {
        if(id === 'formFieldIdModelName')
            setModelName(event)
        else if(id === 'formFieldIdModelDescription')
            setModelDescription(event)
        else if(id === 'formFieldIdModelLabels')
            setModelLabels(event.target.value)
        else if(id === 'formFieldIdModelSamples')
            setModelSamples(event)
        else
            setSelectedAlgorithm({label: event.target.value, value: event.target.value})
    }

    const onFileChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFileName(filename);
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
                            <Image src={`/image/${fileName}`} width={128} height={128} current={""} public={true}/>
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
                        options={algorithmOptions}
                        selectedOption={selectedAlgorithm}
                        onChange={(event)=>onChange('formFieldIdAlgorithms', event)}
                    />
                </FormField>
            </FormSection>
        )
    }

    const onCancel = () => {
        props.onClose();
    }

    const renderCreateIndustrialModel = () => {
        return (
            <Form
            header='Create industrial model'
            description='To use an industrial model for training, deployment, and inference, please create industrial model based on supported algorithm first'
            actions={
                <div>
                    <Button variant='link' onClick={onCancel}>Cancel</Button>
                    <Button variant='primary' onClick={onSubmit} loading={processing}>Submit</Button>
                </div>
            }>
                { renderModelSetting() }
                { renderImagePreview() }
                { renderClassDefinition() }
            </Form>
        )
    }

    const onSubmit = () => {
        setProcessing(true)
        var buffer = {
            'model_name': modelName,
            'model_algorithm': selectedAlgorithm.value,
            'model_description': modelDescription,
            'model_labels': modelLables,
            'model_samples': modelSamples,
            'file_name': fileName
        }
        axios.post('/industrialmodel', buffer)
            .then((response) => {
                var modelId = response.data.id;
                var modelIcon = response.data.icon;
                var industrialModels = props.industrialModels.map((x) => x)
                industrialModels.push({id: modelId, name: modelName, algorithm : selectedAlgorithm.value, description: modelDescription, labels: modelLables.split('\n'), samples: modelSamples, icon: modelIcon})
                props.updateindustrialmodelsAction(industrialModels)
                props.onClose();
            }).catch((error) => {
                console.log(error)
            })
    };
    
    return (
         renderCreateIndustrialModel()
    )
}

const mapDispatchToProps = {
    updateindustrialmodelsAction: Updateindustrialmodels,
};

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(IndustrialModelForm);