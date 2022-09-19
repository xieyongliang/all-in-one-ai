import { Button, Container, Form, FormField, FormSection, Input, Select, Stack, Textarea } from "aws-northstar";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
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
    industrialModel: IIndustrialModel;
    onClose: () => any;
}

const InustrialModelProp: FunctionComponent<IProps> = (props) => {
    var labels = '';

    if(props.industrialModel.labels !== undefined) {
        props.industrialModel.labels.forEach((label) => {
            labels += label + '\n';
        })
        labels = labels.substring(0, labels.length - 1);
    }
    const [ modelName, setModelName ] = useState(props.industrialModel.name);
    const [ modelDescription, setModelDescription ] = useState(props.industrialModel.description);
    const [ modelSamples, setModelSamples ] = useState(props.industrialModel.samples);
    const [ modelLables, setModelLabels ] = useState(labels);
    const [ iconHttpUri, setIconHttpUri ] = useState('');
    const [ fileName, setFileName ] = useState('');
    const [ processing, setProcessing ] = useState(false);

    const { t } = useTranslation();

    const algorithmOptions = useMemo(
        ()=>[],[]
    );    

    useEffect(() => {
        ALGORITHMS.forEach((item)=> {
            algorithmOptions.push({label: item.label, value: item.value})
        })
    }, [algorithmOptions])

    const selectedAlgorithm = algorithmOptions.find((item) => item.value === props.industrialModel.algorithm)

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
        axios.post('/_image', files[0])
        .then((response) => {
            var filename : string = response.data;
            setFileName(filename);
            setIconHttpUri(`/_image/${fileName}`)
        }, (error) => {
            logOutput('error', error.response.data, undefined, error);
        });
    }

    const getHttpUri = async (s3uri) => {
        var response = await axios.get('/s3', {params: {s3uri: s3uri}})
        return response.data
    }

    useEffect(() => {
        getHttpUri(props.industrialModel.icon).then((data) => {
            setIconHttpUri(data.payload[0].httpuri)
        })
     }, [props.industrialModel.icon])

    const renderImagePreview = () => {
        if(iconHttpUri === '') 
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
                        />
                        <FormField controlId={uuidv4()}>
                            <Image 
                                src={iconHttpUri}
                                httpuri={iconHttpUri}
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
                <FormField label={t('industrial_models.overview.sample_images_s3_uri')}controlId={uuidv4()}>
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
                header={t('industrial_models.overview.edit_industrial_model')}
                description={t('industrial_models.overview.create_industrial_model_description')}
                actions={
                <div>
                    <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                    <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
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
        axios.post('/_industrialmodel', buffer)
            .then((response) => {
                var modelId = response.data.id;
                var modelIcon = response.data.icon;
                props.industrialModel.id = modelId
                props.industrialModel.icon = modelIcon
                props.industrialModel.name = modelName
                props.industrialModel.description = modelDescription
                props.industrialModel.labels = modelLables.split('\n');
                props.industrialModel.samples = modelSamples
                var copyIndustrialModels = JSON.parse(JSON.stringify(props.industrialModels))
                var index = copyIndustrialModels.findIndex((industrialModel) =>
                    industrialModel.id === modelId
                )
                copyIndustrialModels[index] = props.industrialModel
                props.updateindustrialmodelsAction(copyIndustrialModels)
                props.onClose()
            }).catch((error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false);
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