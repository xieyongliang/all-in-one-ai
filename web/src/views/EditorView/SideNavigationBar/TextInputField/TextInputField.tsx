import React from 'react';
import {ISize} from "../../../../interfaces/ISize";
import './TextInputField.scss';
import {ImageButton} from "../../../Common/ImageButton/ImageButton";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {updateActiveTextId} from "../../../../store/texts/actionCreators";
import classNames from 'classnames';

interface IProps {
    size: ISize;
    isActive: boolean;
    id: string;
    value: string;
    onDelete: (id: string) => any;
    onChange: (labelRectId: string, labelNameId: string) => any;
}

interface IState {
    animate: boolean;
    value: string;
}

class TextInputField extends React.Component<IProps, IState> {
    private textMargin: number = 4;
    private text: HTMLDivElement;
    private dropdownLabel: HTMLDivElement;

    public constructor(props) {
        super(props);
        this.state = {
            animate: false,
            value: this.props.value
        }
        this.onChange = this.onChange.bind(this)
    }

    public componentDidMount(): void {
        requestAnimationFrame(() => {
            this.setState({ animate: true });
        });
    }

    private getClassName() {
        return classNames(
            "TextInputField",
            {
                "loaded": this.state.animate,
                "active": this.props.isActive
            }
        );
    }

    public onChange(event) {
        this.setState({ value: event.target.value });
    }

    public render() {
        const {size, id, onDelete} = this.props;
        return(
            <div
                className={this.getClassName()}
                style={{
                    width: size.width,
                    height: size.height,
                }}
                key={id}
            >
                <div
                    className="TextInputFieldWrapper"
                    style={{
                        width: size.width,
                        height: size.height,
                    }}
                >
                    <div className="Marker"/>
                    <div className="Content">
                        <div className="ContentWrapper">
                            <div className="Content">
                                <div className="Input"
                                    ref={ref => this.dropdownLabel = ref}
                                >
                                    <input value={this.state.value} onChange={this.onChange}/>
                                </div>
                            </div>
                        </div>
                        <div className="ContentWrapper">
                            <ImageButton
                                externalClassName={"trash"}
                                image={"/ico/trash.png"}
                                imageAlt={"remove_rect"}
                                buttonSize={{width: 30, height: 30}}
                                onClick={() => onDelete(id)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = {
    updateActiveTextId
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TextInputField);