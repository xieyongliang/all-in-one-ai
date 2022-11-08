import { Container, FormField, RadioButton, RadioGroup, Stack, Toggle } from 'aws-northstar';
import { FunctionComponent } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import SampleDataForm from '../../SampleData'
import LocalImageDataForm from '../../LocalData/image';
import { v4 as uuidv4 } from 'uuid';
import { connect } from 'react-redux';
import { AppState } from '../../../../store';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import { useTranslation } from "react-i18next";

interface IProps {
    industrialModels: IIndustrialModel[];
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const StableDiffusionDemoForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        advancedMode,
        onAdvancedModeChange
    }) => {    
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var demoOption = hash === 'sample' || hash === 'local' || hash === 'transformjob' ? hash : 'sample'

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

    var industrialModel = industrialModels.find((item) => item.id === params.id);
    var extra = industrialModel.extra;
    var task = JSON.parse(extra).task === 'image-to-image' ? 'image-to-image' : 'text-to-image'
    return (
        <Stack>
            <Container title = {t('industrial_models.demo.demo_options')}>
                <FormField controlId={uuidv4()}>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label = {t('industrial_models.demo.advanced_mode')} checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'sample' && <SampleDataForm type='json' infer_type='async' with_init_image={task === 'image-to-image'} header={industrialModel.name} train_framework='pytorch' deploy_framework='pytorch'/>}
            {demoOption === 'local' && <LocalImageDataForm infer_type='async' data='' with_init_image={task === 'image-to-image'} header={industrialModels.find((item) => item.id === params.id).name} train_framework='pytorch' deploy_framework='pytorch'/>}
        </Stack>
    )
}

const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(StableDiffusionDemoForm);