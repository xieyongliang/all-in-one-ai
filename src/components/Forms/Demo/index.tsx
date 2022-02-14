import { FunctionComponent, ChangeEvent, useState } from 'react';
import { Stack, Heading, Container, FormGroup, Checkbox } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformForm from '../Transform';
import SampleForm from '../Sample';
import Radio from '../../Utils/Radio';
import RadioGroup from '../../Utils/RadioGroup';

interface DemoProps {
    name: string;
}

const DemoForm: FunctionComponent<DemoProps> = (props) => {
    const [stateType, setStateType] = useState('2')

    function onChange (value: string) {
        setStateType(value)
    }
    
    return (
        <Stack>
            <Heading variant='h1'>{props.name}</Heading>
            <Container title = "Demo type">
                <RadioGroup onChange={onChange} active={stateType}>
		            <Radio value={'0'}>Batch transform</Radio>
		            <Radio value={'1'}>Realtime inference with uploaded image</Radio>
		            <Radio value={'2'}>Realtime inference with sample image</Radio>
		        </RadioGroup>
            </Container>
            {stateType === '0' && <TransformForm/>}
            {stateType === '1' && <InferenceForm/>}
            {stateType === '2' && <SampleForm/>}
        </Stack>
    )
}

export default DemoForm;