import { FunctionComponent, ChangeEvent, useState } from 'react';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import { Stack, Heading } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformForm from '../Transform';

interface DemoProps {
    name: string;
}

const DemoForm: FunctionComponent<DemoProps> = (props) => {
    const [stateType, setStateType] = useState('1')

    const onChange = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var option : string = value || ''
        setStateType(option)
    }
    if(stateType === '1')
        return (
                <Stack>
                    <Heading variant='h4'>{props.name}</Heading>
                    <RadioGroup onChange={onChange}
                        items={[
                            <RadioButton value='0' checked={false}>Batch transform</RadioButton>, 
                            <RadioButton value='1' checked={true}>Realtime inference</RadioButton>                
                        ]}
                    />
                    <InferenceForm/>
                </Stack>
        )
    else
        return (
            <Stack>
                <Heading variant='h4'>{props.name}</Heading>
                <RadioGroup onChange={onChange}
                    items={[
                        <RadioButton value='0' checked={true}>Batch transform</RadioButton>, 
                        <RadioButton value='1' checked={false}>Realtime inference</RadioButton>                
                    ]}
                />
                <TransformForm/>
            </Stack>
    )
}

export default DemoForm;