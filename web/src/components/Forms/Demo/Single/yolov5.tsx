import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup, Toggle, FormField } from 'aws-northstar';
import LocalImageForm from '../../LocalImage';
import SampleImageForm from '../../SampleImage';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectSubType, ProjectType } from '../../../../data/enums/ProjectType';
import { v4 as uuidv4 } from 'uuid';

interface IProps {
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const Yolov5DemoForm: FunctionComponent<IProps> = (
    {
        advancedMode,
        onAdvancedModeChange
    }) => {
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
                    <RadioButton value='sample' checked={demoOption === 'sample'} >Realtime inference with sample image</RadioButton>,
                    <RadioButton value='local' checked={demoOption === 'local'} >Realtime inference with local image</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo options'>
                <FormField controlId={uuidv4()}>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId={uuidv4()}>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'sample' && <SampleImageForm type={ProjectType.OBJECT_DETECTION_RECT} subType={ProjectSubType.OBJECT_DETECTION}/>}
            {demoOption === 'local' && <LocalImageForm type={ProjectType.OBJECT_DETECTION_RECT} subType={ProjectSubType.OBJECT_DETECTION}/>}
        </Stack>
    )
}

export default Yolov5DemoForm;