import { Button, Container, Form, FormField, FormSection, Input, Select, Stack, Textarea } from "aws-northstar";
import { FunctionComponent, useEffect, useState } from "react";
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
    industrialModel: IIndustrialModel;
    onClose: () => any;
}

const InustrialModelProp: FunctionComponent<IProps> = (props) => {
    var labels = ''
    if(props.industrialModel.labels !== undefined) {
        props.industrialModel.labels.forEach((label) => {
            labels += label + '\n'
        })
        labels = labels.substring(0, labels.length - 1)
    }
    const algorithmOptions = [{label: 'Yolov5', value: 'yolov5'}, {label: 'GluonCV', value:'gluoncv'}, {label: 'PaddleOCR', value: 'paddleocr'}]
    const selectedAlgorithm = algorithmOptions.find((item) => item.value === props.industrialModel.algorithm)
    const [ modelName, setModelName ] = useState(props.industrialModel.name)
    const [ modelDescription, setModelDescription ] = useState(props.industrialModel.description)
    const [ modelSamples, setModelSamples ] = useState(props.industrialModel.samples)
    const [ modelLables, setModelLabels ] = useState(labels)
    const [ iconHttpUri, setIconHttpUri ] = useState('')
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
    }

    const onFileChange = (files: (File | FileMetadata)[]) => {
        axios.post('/image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFileName(filename);
            setIconHttpUri(`/image/${fileName}`)
        }, (error) => {
            console.log(error);
        });
    }

    const getHttpUri = async (s3uri) => {
        var response = await axios.get('/s3', {params: {s3uri: s3uri}})
        return response.data
    }

    useEffect(() => {
        getHttpUri(props.industrialModel.icon).then((data) => {
            setIconHttpUri(data.payload)
        })
     }, [props.industrialModel.icon])

    const renderImagePreview = () => {
        if(iconHttpUri === '') 
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
                        <FormField controlId='formFieldIdImage'>
                            <Image src={iconHttpUri} width={128} height={128} current={""} public={true}/>
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
                        disabled={true}
                    />
                </FormField>
            </FormSection>
        )
    }

    const onCancel = () => {
        props.onClose()
    }

    const renderEditIndustrialModel = () => {
        return (
            <Form
                header='Edit industrial model'
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
        var buffer = {
            'model_id': props.industrialModel.id,
            'model_name': modelName,
            'model_algorithm': selectedAlgorithm.value,
            'model_description': modelDescription,
            'model_labels': modelLables,
            'model_samples': modelSamples,
            'model_icon': props.industrialModel.icon,
            'file_name': fileName
        }
        setProcessing(true)
        axios.post('/industrialmodel', buffer)
            .then((response) => {
                var modelId = response.data.id;
                var modelIcon = response.data.icon;
                props.industrialModel.id = modelId
                props.industrialModel.icon = modelIcon
                props.industrialModel.name = modelName
                props.industrialModel.description = modelDescription
                props.industrialModel.labels = modelLables.split('\n');
                props.industrialModel.samples = modelSamples
                props.updateindustrialmodelsAction(props.industrialModels)
                props.onClose()
            }).catch((error) => {
                alert(error)
                console.log(error)
            })
    };

    return (
        renderEditIndustrialModel()
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
)(InustrialModelProp);