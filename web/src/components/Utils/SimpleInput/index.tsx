import { FunctionComponent, ComponentType, useState } from 'react';
import { Input } from 'aws-northstar';

type OnChange = (name: string, value: string) => void

interface SimpleInputProps {
    name: string;
    type?: 'text' | 'password' | 'search' | 'number' | 'email';
    value: string;
    placeHolder?: string;
    onChange: OnChange;
}

const SimpleInput: FunctionComponent<SimpleInputProps> = (props: SimpleInputProps) => {
    const [value, setValue] = useState(props.value);

    const onChange = (event: any) => {
        setValue(event.target.value);
        props.onChange(props.name, event.target.value);
    };

    return (
        <Input
            type={props.type}
            value={value}
            placeholder={props.placeHolder}
            onChange={onChange}
        />
    );
}

export default SimpleInput;