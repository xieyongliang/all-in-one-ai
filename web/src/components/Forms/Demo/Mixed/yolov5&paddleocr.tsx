import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup } from 'aws-northstar';
import InferenceForm from '../../Inference';
import SampleForm from '../../Sample';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectSubType, ProjectType } from '../../../../data/enums/ProjectType';

const YolovPaddleOCRDemoForm: FunctionComponent = () => {
    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var demoType = hash === 'sample' || hash === 'uploaded' || hash === 'transformjob' ? hash : 'sample'

    const onChangeOptions = (event, value) => {
        history.push(`/imodels/${params.id}?tab=demo#${value}`);
    }

    const renderDemoOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='sample' checked={demoType === 'sample'} >Realtime inference with sample image</RadioButton>,
                    <RadioButton value='uploaded' checked={demoType === 'uploaded'} >Realtime inference with uploaded image</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo options'>
                {renderDemoOptions()}
            </Container>
            {demoType === 'sample' && <SampleForm type={ProjectType.TEXT_RECOGNITION} subType={ProjectSubType.OBJECT_DETECTION}/>}
            {demoType === 'uploaded' && <InferenceForm type={ProjectType.TEXT_RECOGNITION} subType={ProjectSubType.OBJECT_DETECTION}/>}
        </Stack>
    )
}

export default YolovPaddleOCRDemoForm;