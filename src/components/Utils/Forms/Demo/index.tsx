import { FunctionComponent, ChangeEvent } from 'react';
import RadioButton from 'aws-northstar/components/RadioButton';
import RadioGroup from 'aws-northstar/components/RadioGroup';
import { Stack, Heading } from 'aws-northstar';

const onChange = (event?: ChangeEvent<HTMLInputElement>, value?: string)=>{
    alert(value);
}

interface DemoProps {
    name: string;
}

const DemoPage: FunctionComponent<DemoProps> = (props) => {
    return (
            <Stack>
            <Heading variant='h4'>{props.name}</Heading>
            <RadioGroup onChange={onChange}
                items={[
                    <RadioButton value="0">Batch transform</RadioButton>, 
                    <RadioButton value="1">Realtime inference</RadioButton>                
                ]}
            />
            </Stack>
    );
}

export default DemoPage;