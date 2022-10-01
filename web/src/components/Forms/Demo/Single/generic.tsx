import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup, Toggle, FormField } from 'aws-northstar';
import LocalImageForm from '../../LocalImage';
import SampleImageForm from '../../SampleImage';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectSubType, ProjectType } from '../../../../data/enums/ProjectType';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";
import { connect } from 'react-redux';
import { AppState } from '../../../../store';

interface IProps {
    industrialModels,
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const GenericDemoForm: FunctionComponent<IProps> = (
    {
        industrialModels,
        advancedMode,
        onAdvancedModeChange
    }) => {
    const { t } = useTranslation();

    const history = useHistory();

    var params : PathParams = useParams();

    var industrialModel = industrialModels.find((item) => item.id === params.id)

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

    var type = JSON.parse(industrialModel.extra).type;
    var subtype = JSON.parse(industrialModel.extra).subtype;

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

            {type === 'image_rank' && subtype === 'image_rank_float' && demoOption === 'sample' && <SampleImageForm type={ProjectType.IMAGE_RANK} subType={ProjectSubType.IMAGE_RANK_FLOAT}/>}
            {type === 'image_rank' && subtype === 'image_rank_float' && demoOption === 'local' && <LocalImageForm type={ProjectType.IMAGE_RANK} subType={ProjectSubType.IMAGE_RANK_FLOAT}/>}
        </Stack>
    )
}


const mapStateToProps = (state: AppState) => ({
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps
)(GenericDemoForm);