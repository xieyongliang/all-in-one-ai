import { FunctionComponent, useState } from 'react';
import Select from 'aws-northstar/components/Select';
import { SelectOption } from 'aws-northstar/components/Select/types';

type OnChange = (name: string, value: string) => void

interface SimpleSelectProps {
    name: string;
    placeholder: string;
    options: SelectOption[];
    selectedOption?: SelectOption;
    onChange: OnChange;
}

const SimpleSelect: FunctionComponent<SimpleSelectProps> = (props: SimpleSelectProps) => {
    const [selectedOption, setSeletedOption] = useState<SelectOption>(props.selectedOption);

    const onChange = (event: any) => {
        setSeletedOption({ value: event.target.value });
        props.onChange(props.name, event.target.value);
    };

    console.log(selectedOption)

    return (
        <Select
            placeholder={props.placeholder}
            options={props.options}
            selectedOption={selectedOption}
            onChange={onChange}
        />
    );
}

export default SimpleSelect;