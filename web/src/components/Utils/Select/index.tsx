import { SelectOption } from 'aws-northstar/components/Select';
import { FunctionComponent } from 'react';
import { MenuItem, Select as MaterialSelect } from "@mui/material";

export interface SelectProps {
    options: SelectOption[];
    placeholder?: string;
    selectedOption?: SelectOption;
    onChange: (option: SelectOption) => any;
}

const Select: FunctionComponent<SelectProps> = (props) => {
    
    const onChange = (event) => {
        props.onChange(props.options.find((option) => option.value === event.target.value));
    }

    return (
        <MaterialSelect
            onChange={onChange}
            value = {props.selectedOption !== undefined ? props.selectedOption.value : ''}
            MenuProps={{
                style: { zIndex: 10000 , width: 280, height: 300}
              }}
            style = { { zIndex: 5000, width: 280, height: 30 }}
        >
        {
            props.options.map((option) => {
                return (
                    <MenuItem value={option.value}>{option.label}</MenuItem>          
                )
            })
        }
        </MaterialSelect>
    )
}

export default Select;