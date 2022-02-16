import { FunctionComponent, ChangeEvent, useState } from 'react';
import { Stack, Heading, Container, FormGroup, Checkbox } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformJobList from '../../Lists/TransformJob';
import SampleForm from '../Sample';
import Radio from '../../Utils/Radio';
import RadioGroup from '../../Utils/RadioGroup';
import { useParams } from 'react-router-dom';

interface PathParams {
    name: string;
    type: string;
}

interface DemoProps {
    name: string;
}

const DemoForm: FunctionComponent<DemoProps> = (props) => {
    var params : PathParams = useParams();
    var name = params.name
    var type = params.type

    const [stateType, setStateType] = useState((type === 'sample') ? '2' : (type === 'uploaded' ? '1' : (type === 'batch' ? '0' : '2')))

    function onChange (value: string) {
        setStateType(value)
    }
    
    return (
        <Stack>
            <Heading variant='h1'>{props.name}</Heading>
            <Container title = "Demo type">
                <RadioGroup onChange={onChange} active={stateType}>
		            <Radio value={'0'}>Batch transform jobs</Radio>
		            <Radio value={'1'}>Realtime inference with uploaded image</Radio>
		            <Radio value={'2'}>Realtime inference with sample image</Radio>
		        </RadioGroup>
            </Container>
            {stateType === '0' && <TransformJobList name={props.name}/>}
            {stateType === '1' && <InferenceForm/>}
            {stateType === '2' && <SampleForm/>}
        </Stack>
    )
}

export default DemoForm;