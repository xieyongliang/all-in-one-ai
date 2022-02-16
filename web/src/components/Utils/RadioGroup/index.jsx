import React, { Component } from 'react';
class RadioGroup extends Component {
    handleActiveChange(value) {
        console.log(`${value}被选中了`)
        this.props.onChange(value)
    }
    render() {
        return (
            <div>
                {
                    React.Children.map(this.props.children, child => {
                        let isActive = this.props.active === child.props.value ? true : false
                        return React.cloneElement(child, {
                            label: child.props.children,
                            value: child.props.value,
                            active: isActive,
                            onClick: this.handleActiveChange.bind(this)
                        })
                    })
                }
            </div>
        )
    }
}
export default RadioGroup;