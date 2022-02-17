import { FunctionComponent, ChangeEvent, useState } from 'react';
import { Stack, Heading, Container, FormGroup, Checkbox } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformJobList from '../../Lists/TransformJob';
import SampleForm from '../Sample';
import Radio from '../../Utils/Radio';
import RadioGroup from '../../Utils/RadioGroup';
import { useParams, useLocation, useHistory } from 'react-router-dom';

interface PathParams {
    name: string;
}

interface DemoProps {
    name: string;
}

const DemoForm: FunctionComponent<DemoProps> = (props) => {
    const history = useHistory();

    var params : PathParams = useParams();
    var name = params.name;

    const search = new URLSearchParams(useLocation().search);

    const [ tab, setTab ] = useState(search.get('tab') !== undefined ? search.get('tab') : 'sample')

    function onChange (value: string) {
        history.push('/case/' + name + '/demo?' + 'tab=' + value);
        setTab(value);
    }
    
    return (
        <Stack>
            <Heading variant='h1'>{props.name}</Heading>
            <Container title = "Demo type">
                <RadioGroup onChange={onChange} active={tab}>
		            <Radio value={'transform'}>Batch transform jobs</Radio>
		            <Radio value={'uploaded'}>Realtime inference with uploaded image</Radio>
		            <Radio value={'sample'}>Realtime inference with sample image</Radio>
		        </RadioGroup>
            </Container>
            {tab === 'transform' && <TransformJobList name={props.name}/>}
            {tab === 'uploaded' && <InferenceForm/>}
            {tab === 'sample' && <SampleForm/>}
        </Stack>
    )
}

export default DemoForm;