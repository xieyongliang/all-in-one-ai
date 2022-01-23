import { FunctionComponent, ChangeEvent, useState } from 'react';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import { Stack, Heading } from 'aws-northstar';
import InferencePage from '../Inference';

interface DemoProps {
    name: string;
}

const DemoPage: FunctionComponent<DemoProps> = (props) => {
    const [option, setOption] = useState('1')

    const onChange = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
        var option : string = value || ''
        setOption(option)
    }
    if(option === '1')
        return (
                <Stack>
                <Heading variant='h4'>{props.name}</Heading>
                <RadioGroup onChange={onChange}
                    items={[
                        <RadioButton value='0' checked={false}>Batch transform</RadioButton>, 
                        <RadioButton value='1' checked={true}>Realtime inference</RadioButton>                
                    ]}
                />
                <InferencePage/>
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
            </Stack>
    )
}

export default DemoPage;