import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformJobList from '../../Lists/TransformJob';
import SampleForm from '../Sample';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../Interfaces/PathParams';

const DemoForm: FunctionComponent = () => {
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
                    <RadioButton value='transformjob' checked={demoType === 'transformjob'} >Batch transform jobs</RadioButton>, 
                    <RadioButton value='uploaded' checked={demoType === 'uploaded'} >Realtime inference with uploaded image</RadioButton>,
                    <RadioButton value='sample' checked={demoType === 'sample'} >Realtime inference with sample image</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo type'>
                {renderDemoOptions()}
            </Container>
            {demoType === 'transformjob' && <TransformJobList/>}
            {demoType === 'uploaded' && <InferenceForm/>}
            {demoType === 'sample' && <SampleForm/>}
        </Stack>
    )
}

export default DemoForm;