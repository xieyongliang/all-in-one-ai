import { FunctionComponent, ChangeEvent, useState } from 'react';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import { Stack, Heading } from 'aws-northstar';
import InferenceForm from '../Inference';
import TransformForm from '../Transform';
import SampleForm from '../Sample';

interface DemoProps {
    name: string;
}

const DemoForm: FunctionComponent<DemoProps> = (props) => {
    const [stateType, setStateType] = useState('2')

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
                            <RadioButton value='1' checked={true}>Realtime inference with uploaded image</RadioButton>,                
                            <RadioButton value='2' checked={false}>Realtime inference with sample image</RadioButton>,                
                        ]}
                    />
                    <InferenceForm/>
                </Stack>
        )
    else if(stateType === '0')
        return (
            <Stack>
                <Heading variant='h4'>{props.name}</Heading>
                <RadioGroup onChange={onChange}
                    items={[
                        <RadioButton value='0' checked={true}>Batch transform</RadioButton>, 
                        <RadioButton value='1' checked={false}>Realtime inference with uploaded image</RadioButton>,                
                        <RadioButton value='2' checked={false}>Realtime inference with sample image</RadioButton>,                
                ]}
                />
                <TransformForm/>
            </Stack>
        )
    else
        return (
            <Stack>
                <Heading variant='h4'>{props.name}</Heading>
                <RadioGroup onChange={onChange}
                    items={[
                        <RadioButton value='0' checked={false}>Batch transform</RadioButton>, 
                        <RadioButton value='1' checked={false}>Realtime inference with uploaded image</RadioButton>,                
                        <RadioButton value='2' checked={true}>Realtime inference with sample image</RadioButton>,                
                ]}
                />
                <SampleForm/>
            </Stack>
    )
}

export default DemoForm;