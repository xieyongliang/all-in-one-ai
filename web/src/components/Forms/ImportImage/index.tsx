import { Button, Form, FormField, Input } from 'aws-northstar';
import Select, { SelectOption } from 'aws-northstar/components/Select';
import { FunctionComponent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { logOutput } from '../../Utils/Helper';
import { IIndustrialModel } from '../../../store/industrialmodels/reducer';

export interface ImagePreviewProps {
    header: string;
    industrialModel: IIndustrialModel;
    endpointOptions?: SelectOption[]; 
    onClose: ()=>any;
}

const ImportImage: FunctionComponent<ImagePreviewProps> = (props) => {
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ processing, setProcessing ] = useState(false)

    const { t } = useTranslation();

    const onChange = (id, event) => {
        if(id === 'formFieldIdEndpoint')
            setSelectedEndpoint({label: event.target.value, value: event.target.value})
    }

    const onCancel = () => {
        props.onClose();
    }
    
    const onSubmit = () => {
        setProcessing(true)
        axios.get('/search/import', {params : {industrial_model : props.industrialModel.id, endpoint_name: selectedEndpoint.value, model_samples: props.industrialModel.samples}})
            .then((response) => {
                setTimeout(() => {
                    setProcessing(false)
                    props.onClose()
                  }, 60000);
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false);
            })
    }

    return (
        <Form 
            header = {props.header}
            actions={
                <div>
                    <Button variant='link' onClick={onCancel}>{t('industrial_models.common.cancel')}</Button>
                    <Button variant='primary' onClick={onSubmit} loading={processing}>{t('industrial_models.common.submit')}</Button>
                </div>
            }
        >
            <FormField controlId={uuidv4()} label={t('industrial_models.demo.select_endpoint')}>
                <Select
                    options={props.endpointOptions}
                    selectedOption={selectedEndpoint}
                    onChange={(event) => onChange('formFieldIdEndpoint', event)}
                />
            </FormField>
            <FormField controlId={uuidv4()} label={t('industrial_models.transform_job.s3_location')}>
                <Input value={props.industrialModel.samples} readonly={true} />
            </FormField>
        </Form>
    )
}

export default ImportImage;