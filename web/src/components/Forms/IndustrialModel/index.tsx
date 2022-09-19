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
import { ALGORITHMS } from '../../Data/data';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import { logOutput } from "../../Utils/Helper";

interface IProps {
    updateindustrialmodelsAction : (industrialModels : IIndustrialModel[]) => any
    industrialModels: IIndustrialModel[];
    onClose: () => any;
}

const IndustrialModelForm: FunctionComponent<IProps> = (props) => {
    const [ selectedAlgorithm, setSelectedAlgorithm] = useState({label: 'Yolov5', value: 'yolov5'})
    const [ modelName, setModelName ] = useState('')
    const [ modelDescription, setModelDescription ] = useState('')
    const [ modelSamples, setModelSamples ] = useState('')
    const [ modelLables, setModelLabels ] = useState('')
    const [ fileName, setFileName ] = useState('')
    const [ processing, setProcessing ] = useState(false)
    const [ algorithmOptions, setAlgorithmOptions ] = useState([])

    const { t } = useTranslation();

    useEffect(() => {
        var algorithmOptions = []
        ALGORITHMS.forEach((item)=> {
            algorithmOptions.push({label: item.label, value: item.value})
        })
        setAlgorithmOptions(algorithmOptions)
    }, [])

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
        axios.post('/_image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFileName(filename);
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }

    const renderImagePreview = () => {
        if(fileName === '') 
            return (
                <Container title={t('industrial_models.overview.select_icon')}>
                    <FileUpload
                        controlId={uuidv4()}
                        onChange={onFileChange}
                        buttonText={t('industrial_models.common.choose_file')}
                    />
                </Container>
            )
        else 
            return (
                <Stack>
                    <Container title={t('industrial_models.overview.select_icon')}>
                        <FileUpload
                            controlId={uuidv4()}
                            onChange={onFileChange}
                            buttonText={t('industrial_models.common.choose_file')}
                        />
                        <FormField controlId={uuidv4()}>
                            <Image 
                                src={`/_image/${fileName}`}
                                httpuri={`/_image/${fileName}`}
                                width={128} 
                                height={128} 
                                current={""} 
                                public={true}
                            />
                        </FormField>          
                    </Container>
                </Stack> 
            )
    }

    const renderClassDefinition = () => {
        return (
            <FormSection header={t('industrial_models.overview.class_and_sample_settings')} >
                <FormField label={t('industrial_models.overview.class_definition')} controlId={uuidv4()}>
                    <Textarea value={modelLables} onChange={(event) => onChange('formFieldIdModelLabels', event)} />        
                </FormField>
                <FormField label={t('industrial_models.overview.sample_images_s3_uri')} controlId={uuidv4()}>
                    <Input type="text" value={modelSamples} onChange={(event) => onChange('formFieldIdModelSamples', event)} />        
                </FormField>
            </FormSection>
        )
    }

    const renderModelSetting = () => {
        return (
            <FormSection header={t('industrial_models.overview.class_and_sample_settings')} >
                <FormField label={t('industrial_models.overview.industrial_model_name')} controlId={uuidv4()}>
                    <Input type="text" value={modelName} onChange={(event) => onChange('formFieldIdModelName', event)}/>
                </FormField>
                <FormField label={t('industrial_models.overview.industrial_model_description')} controlId={uuidv4()}>
                    <Input type="text" value={modelDescription} onChange={(event) => onChange('formFieldIdModelDescription', event)}/>
                </FormField>
                <FormField label={t('industrial_models.overview.industrial_model_algorithm')} controlId={uuidv4()}>
                    <Select
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
                header={t('industrial_models.overview.create_industrial_model')}
                description={t('industrial_models.overview.create_industrial_model_description')}
                actions={
                    <div>
                        <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                        <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
                    </div>
                }
            >
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
        axios.post('/_industrialmodel', buffer)
            .then((response) => {
                var modelId = response.data.id;
                var modelIcon = response.data.icon;
                var industrialModels = props.industrialModels.map((x) => x)
                industrialModels.push({id: modelId, name: modelName, algorithm : selectedAlgorithm.value, description: modelDescription, labels: modelLables.split('\n'), samples: modelSamples, icon: modelIcon})
                props.updateindustrialmodelsAction(industrialModels)
                props.onClose();
            }).catch((error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false);
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