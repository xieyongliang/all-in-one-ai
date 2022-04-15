import { FunctionComponent } from 'react';
import { Stack, Container, RadioButton, RadioGroup, FormField, Toggle } from 'aws-northstar';
import InferenceForm from '../../Inference';
import SampleForm from '../../Sample';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../../Interfaces/PathParams';
import { ProjectType } from '../../../../data/enums/ProjectType';

interface IProps {
    advancedMode: boolean;
    onAdvancedModeChange : (checked) => any;
}

const PaddleOCRDemoForm: FunctionComponent<IProps> = ( 
    {
        advancedMode,
        onAdvancedModeChange
    }) => {
    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var demoOption = hash === 'sample' || hash === 'uploaded' ? hash : 'sample'

    const onChangeOptions = (event, value) => {
        history.push(`/imodels/${params.id}?tab=demo#${value}`);
    }

    const renderDemoOptions = () => {
        return (
            <RadioGroup onChange={onChangeOptions}
                items={[
                    <RadioButton value='uploaded' checked={demoOption === 'uploaded'} >Realtime inference with uploaded image</RadioButton>,
                    <RadioButton value='sample' checked={demoOption === 'sample'} >Realtime inference with sample image</RadioButton>,
                ]}
            />
        )
    }

    return (
        <Stack>
            <Container title = 'Demo option'>
                <FormField controlId='Demo options'>            
                    {renderDemoOptions()}
                </FormField>
                <FormField controlId='Advanced mode'>
                    <Toggle label='Advanced mode' checked={advancedMode} onChange={onAdvancedModeChange}/>
                </FormField>
            </Container>
            {demoOption === 'uploaded' && <InferenceForm type={ProjectType.TEXT_RECOGNITION}/>}
            {demoOption === 'sample' && <SampleForm type={ProjectType.TEXT_RECOGNITION}/>}
        </Stack>
    )
}

export default PaddleOCRDemoForm;