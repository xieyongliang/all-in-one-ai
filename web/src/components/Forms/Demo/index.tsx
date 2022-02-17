import { FunctionComponent, ChangeEvent, useState } from 'react';
import { Stack, Heading, Container, FormGroup, Checkbox } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformJobList from '../../Lists/TransformJob';
import SampleForm from '../Sample';
import Radio from '../../Utils/Radio';
import RadioGroup from '../../Utils/RadioGroup';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import { PathParams } from '../../Utils/PathParams';

const DemoForm: FunctionComponent = () => {
    const history = useHistory();

    var params : PathParams = useParams();

    var localtion = useLocation();
    var hash = localtion.hash.substring(1);

    var type = hash === 'sample' || hash === 'uploaded' || hash === 'transform' ? hash : 'sample'

    function onChange (value: string) {
        history.push('/case/' + params.name + '?tab=demo' + '#' + value);
    }
    
    return (
        <Stack>
            <Heading variant='h1'>{params.name}</Heading>
            <Container title = "Demo type">
                <RadioGroup onChange={onChange} active={type}>
		            <Radio value={'transform'}>Batch transform jobs</Radio>
		            <Radio value={'uploaded'}>Realtime inference with uploaded image</Radio>
		            <Radio value={'sample'}>Realtime inference with sample image</Radio>
		        </RadioGroup>
            </Container>
            {type === 'transform' && <TransformJobList/>}
            {type === 'uploaded' && <InferenceForm/>}
            {type === 'sample' && <SampleForm/>}
        </Stack>
    )
}

export default DemoForm;