import React, { FunctionComponent, ComponentType, useState } from 'react';
import Select from 'aws-northstar/components/Select';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

type ButtonIconType =
    | 'add_plus'
    | 'copy'
    | 'external'
    | 'folder'
    | 'refresh'
    | 'settings'
    | ComponentType<SvgIconProps>;

interface SelectOption {
    label?: string;
    value?: string;
    disabled?: boolean;
    iconName?: ButtonIconType;
    options?: SelectOption[];
    group?: string;
}

type OnChange = (name: string, value: string) => void

interface SimpleSelectProps {
    options: SelectOption[];
    onChange: OnChange;
    name: string;
    placeholder: string;
}

const SimpleSelect: FunctionComponent<SimpleSelectProps> = (props: SimpleSelectProps) => {
    const [selectedOption, setSeletedOption] = React.useState<SelectOption>();

    const onChange = (event: any) => {
        setSeletedOption({ value: event.target.value });
        props.onChange(props.name, event.target.value)
    };

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