import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup, FormField, Toggle } from 'aws-northstar';
import LocalImageForm from '../../LocalImage';
import SampleImageForm from '../../SampleImage';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectType } from '../../../../data/enums/ProjectType';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

interface IProps {
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const PaddleOCRDemoForm: FunctionComponent<IProps> = ( 
    {
        advancedMode,
        onAdvancedModeChange
    }) => {
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var demoOption = hash === 'sample' || hash === 'local' ? hash : 'sample'

    const onChangeOptions = (event, value) => {
        history.push(`/imodels/${params.id}?tab=demo#${value}`);
    }

    const renderDemoOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='sample' checked={demoOption === 'sample'} >{t('industrial_models.demo.demo_option_sample')}</RadioButton>,
                    <RadioButton value='local' checked={demoOption === 'local'} >{t('industrial_models.demo.demo_option_local')}</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = {t('industrial_models.demo.demo_options')}>
                <FormField controlId={uuidv4()}>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label={t('industrial_models.demo.advanced_mode')} checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'sample' && <SampleImageForm type={ProjectType.TEXT_RECOGNITION}/>}
            {demoOption === 'local' && <LocalImageForm type={ProjectType.TEXT_RECOGNITION}/>}
        </Stack>
    )
}

export default PaddleOCRDemoForm;