import React, { Component } from 'react';
import "./index.scss"

class Radio extends Component {
    render() {
        return (
            <div className="radio-wrap" onClick={this.props.onClick.bind(this,this.props.value)}>
                <div className="left">
                    <div className={`circle ${this.props.active === true ? 'active' : ''} `}>
                        <div className="fork"></div>
                    </div>
                    <div className="label">{this.props.label}</div>
                </div>
            </div>
        )
    }
}
export default Radio;