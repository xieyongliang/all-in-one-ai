import { FunctionComponent, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Form, FormSection, LoadingIndicator, FormField, Input } from 'aws-northstar';
import axios from 'axios';
import { logOutput } from '../../Utils/Helper';
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    endpointName: string;
    onClose: () => any;
}

const EndpointASGForm: FunctionComponent<IProps> = (props) => {
    const [ minCapacity, setMinCapacity ] = useState(1)
    const [ maxCapacity, setMaxCapacity ] = useState(2)
    const [ targetValue, setTargetValue ] = useState(5)
    const [ scaleInCoolDown, setScaleInCoolDown ] = useState(600)
    const [ scaleOutCoolDown, setScaleOutCoolDown ] = useState(300)
    const [ loading, setLoading ] = useState(true);
    const [ processing, setProcessing ] = useState(false)

    const { t } = useTranslation();

    const history = useHistory();

    useEffect(() => {
        axios.get(`/endpoint/${props.endpointName}`, {params : {action: 'asg'}})
            .then((response) => {
            setMinCapacity(response.data.asg_min_capacity)
            setMaxCapacity(response.data.asg_max_capacity)
            setTargetValue(response.data.asg_target_value)
            setScaleInCoolDown(response.data.asg_scale_in_cooldown)
            setScaleOutCoolDown(response.data.asg_scale_out_cooldown)
            setLoading(false);
        }, (error) => {
            console.log(error)
        });
    }, [props.endpointName])

    const onApply = () => {
        var body = {
            'asg_min_capacity': minCapacity,
            'asg_max_capacity' : maxCapacity,
            'asg_target_value': targetValue,
            'asg_scale_in_cooldown': scaleInCoolDown,
            'asg_scale_out_cooldown': scaleOutCoolDown
        }
        setProcessing(true)
        axios.post(`/endpoint/${props.endpointName}`, body,  { headers: {'content-type': 'application/json' }, params : {action: 'asg'}}) 
            .then((response) => {
                setProcessing(false)
                props.onClose()
            }, (error) => {
                logOutput('error', error.response.data, undefined, error);
                setProcessing(false)
            });
    }

    const onClose = () => {
        props.onClose()
    }

    const onChange = (id: string, event: any) => {
        if(id === 'formFieldIdMinCapacity')
            setMinCapacity(event)
        if(id === 'formFieldIdMaxCapacity')
            setMaxCapacity(event)
        if(id === 'formFieldIdTargetValue')
            setTargetValue(event)
        if(id === 'formFieldIdScaleInCoolDown')
            setScaleInCoolDown(event)    
        if(id === 'formFieldIdScaleOutCoolDown')
            setScaleOutCoolDown(event)
    }

    const renderEndpointAutoScalingGroupSettings = () => {
        return (
            <FormSection header={t('industrial_models.endpoint.asg_policy')}>
                <FormField label={t('industrial_models.endpoint.asg_min_capacity')} controlId={uuidv4()}>
                    <Input type='text' value={minCapacity} onChange={(event) => {onChange('formFieldIdMinCapacity', event)}} />
                </FormField>
                <FormField label={t('industrial_models.endpoint.asg_max_capacity')} controlId={uuidv4()}>
                    <Input type='text' value={maxCapacity} onChange={(event) => {onChange('formFieldIdMaxCapacity', event)}} />
                </FormField>
                <FormField label={t('industrial_models.endpoint.asg_target_value')} controlId={uuidv4()}>
                    <Input type='text' value={targetValue} onChange={(event) => {onChange('formFieldIdTargetValue', event)}} />
                </FormField>
                <FormField label={t('industrial_models.endpoint.asg_scale_in_cooldown')} controlId={uuidv4()}>
                    <Input type='text' value={scaleInCoolDown} onChange={(event) => {onChange('formFieldIdScaleInCoolDown', event)}} />
                </FormField>
                <FormField label={t('industrial_models.endpoint.asg_scale_out_cooldown')} controlId={uuidv4()}>
                    <Input type='text' value={scaleOutCoolDown} onChange={(event) => {onChange('formFieldIdScaleOutCoolDown', event)}} />
                </FormField>
            </FormSection>
        )
    }

    return (
        <Form
            header={t('industrial_models.endpoint.asg_settings')}
            actions={
                <div>
                    <Button variant='link' onClick={onClose}>{t('industrial_models.demo.close')}</Button>
                    <Button variant='primary' loading={processing} onClick={onApply}>{t('industrial_models.common.submit')}</Button>
                </div>
            }>   
            { loading && <LoadingIndicator label={t('industrial_models.demo.loading')}/> }
            { !loading && renderEndpointAutoScalingGroupSettings() }
        </Form>
    )
}

export default EndpointASGForm;