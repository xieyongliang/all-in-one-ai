import { SelectOption } from 'aws-northstar/components/Select';
import { IRect } from 'konva/lib/types';
import { FunctionComponent, ReactNode, useState } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { EventType } from '../../../data/enums/EventType';
import { IPoint } from '../../../interfaces/IPoint';
import { RectUtil } from '../../../utils/RectUtil';
import './index.scss';

export interface SelectProps {
    options: SelectOption[];
    placeholder?: string;
    selectedOption?: SelectOption;
    onChange: (option: SelectOption) => any;
}

const Select: FunctionComponent<SelectProps> = (props) => {
    const [ dropdownLabel, setDropDownLabel] = useState<HTMLDivElement>();
    const [ dropdown, setDropDown] = useState<HTMLDivElement>();
    const [ isOpen, setIsOpen ] = useState(false);
    const dropdownOptionHeight: number = 40;
    const dropdownOptionCount: number = 6;
    const dropdownMargin: number = 4;

    const getDropdownStyle = ():React.CSSProperties => {
        const clientRect = dropdownLabel.getBoundingClientRect();
        const height: number = Math.min(props.options.length, dropdownOptionCount) * dropdownOptionHeight;
        const style = {
            width: clientRect.width,
            height: height,
            left: clientRect.left,
        };

        if (window.innerHeight * 2/3 < clientRect.top)
            return Object.assign(style, {top: clientRect.top - dropdownMargin - height});
        else
            return Object.assign(style, {top: clientRect.bottom + dropdownMargin});
    };    

    const getDropdownOptions = ():ReactNode => {
        const onClick = (value: string, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            setIsOpen(false);
            window.removeEventListener(EventType.MOUSE_DOWN, closeDropdown);
            var option = props.options.find((option) => option.value === value);
            props.onChange(option)
            event.stopPropagation();
        };

        return props.options.map((selectedOption) => {
            return <div
                className="DropdownOption"
                key={selectedOption.value}
                style={{height: dropdownOptionHeight}}
                onClick={(event) => onClick(selectedOption.value, event)}
            >
                {selectedOption.label}
            </div>
        })
    }

    const openDropdown = () => {
        setIsOpen(true);
        window.addEventListener(EventType.MOUSE_DOWN, closeDropdown);
    };

    const closeDropdown = (event: MouseEvent) => {
        if(dropdown === undefined || dropdown === null) return
        const mousePosition: IPoint = {x: event.clientX, y: event.clientY};
        const clientRect = dropdown.getBoundingClientRect();
        const dropDownRect: IRect = {
            x: clientRect.left,
            y: clientRect.top,
            width: clientRect.width,
            height: clientRect.height
        };

        if (!RectUtil.isPointInside(dropDownRect, mousePosition)) {
            setIsOpen(false);
            window.removeEventListener(EventType.MOUSE_DOWN, closeDropdown)
        }
    };

    return (
        <div className="ContentWrapper">
            <div className="DropdownLabel"
                ref= { ref => setDropDownLabel(ref)}
                onClick={openDropdown}
            >
                {props.selectedOption !== undefined ? props.selectedOption.label : (props.placeholder !== undefined ? props.placeholder : '')}
            </div>
            {   
                isOpen && 
                <div
                    className="Dropdown"
                    style={getDropdownStyle()}
                    ref={ref => setDropDown(ref)}
                >
                    <Scrollbars
                        renderTrackHorizontal={props => <div {...props} className="track-horizontal"/>}
                    >
                        <div>
                            {getDropdownOptions()}
                        </div>
                    </Scrollbars>
                </div>
            }
        </div>
    )
}

export default Select;