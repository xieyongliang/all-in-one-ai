import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup, Toggle, FormField } from 'aws-northstar';
import InferenceForm from '../../Inference';
import TransformJobList from '../../../Lists/TransformJob';
import SampleForm from '../../Sample';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectType } from '../../../../data/enums/ProjectType';

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

    var demoOption = hash === 'sample' || hash === 'uploaded' || hash === 'transformjob' ? hash : 'sample'

    const onChangeOptions = (event, value) => {
        history.push(`/imodels/${params.id}?tab=demo#${value}`);
    }

    const renderDemoOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='sample' checked={demoOption === 'sample'} >Realtime inference with sample image</RadioButton>,
                    <RadioButton value='uploaded' checked={demoOption === 'uploaded'} >Realtime inference with uploaded image</RadioButton>,
                    <RadioButton value='transformjob' checked={demoOption === 'transformjob'} >Manage batch transform jobs and review</RadioButton>, 
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo options'>
                <FormField controlId='Demo options'>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId='Advanced mode'>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'sample' && <SampleForm type={ProjectType.OBJECT_DETECTION_RECT}/>}
            {demoOption === 'uploaded' && <InferenceForm type={ProjectType.OBJECT_DETECTION_RECT}/>}
            {demoOption === 'transformjob' && <TransformJobList/>}
        </Stack>
    )
}

export default Yolov5DemoForm;