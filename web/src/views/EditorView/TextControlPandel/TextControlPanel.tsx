import React, { useState } from 'react';
import './TextControlPanel.scss';
import { updatePreventCustomCursorStatus } from "../../../store/general/actionCreators";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import { IPoint } from "../../../interfaces/IPoint";
import classNames from "classnames";
import { TextRect } from "../../../store/texts/types";
import { ImageButton } from "../../Common/ImageButton/ImageButton";
import { TextImageData } from "../../../store/texts/types";
import {updateTextImageDataById } from "../../../store/texts/actionCreators";
import { TextActions } from '../../../logic/actions/TextActions';

interface IProps {
    position: IPoint;
    updatePreventCustomCursorStatus: (preventCustomCursor: boolean) => any;
    activeTextId: string;
    highlightedTextId: string;
    textData: TextRect;
    imageData: TextImageData;
    updateTextImageDataById: (id: string, newImageData: TextImageData) => any;
}

const TextControlPanel: React.FC<IProps> = ({position, updatePreventCustomCursorStatus, activeTextId, highlightedTextId, textData, imageData, updateTextImageDataById}) => {
    const [isActive, setIsActiveStatus] = useState(false);

    const onMouseEnter = () => {
        updatePreventCustomCursorStatus(true);
        setIsActiveStatus(true);
    };

    const onMouseLeave = () => {
        updatePreventCustomCursorStatus(false);
        setIsActiveStatus(false);
    };

    const onAccept = () => {
        const newImageData = {
            ...imageData,
            textRects: imageData.textRects.map((textRect: TextRect) => {
                if (textRect.id === textData.id) {
                    const text = textData
                    return {
                        ...textRect,
                        textId: !!text ? text.id : textRect.id
                    }
                } else {
                    return textRect
                }
            })
        };
        updateTextImageDataById(imageData.id, newImageData);
        updatePreventCustomCursorStatus(false);
    };

    const onReject = () => {
        TextActions.deleteRectTextById(imageData.id, textData.id);
        updatePreventCustomCursorStatus(false);
    };

    const getClassName = () => {
        return classNames(
            "LabelControlPanel", {
                "is-active": isPanelActive()
            }
        );
    };

    const isPanelActive = () => {
        return isActive || textData.id === activeTextId || textData.id === highlightedTextId
    };

    return <div
        className={getClassName()}
        style={{top: position.y, left: position.x}}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
    >
        {isPanelActive() && <>
            <ImageButton
                image={"/ico/plus.png"}
                imageAlt={"plus"}
                buttonSize={{width: 30, height: 30}}
                padding={15}
                onClick={onAccept}
            />
            <ImageButton
                image={"/ico/trash.png"}
                imageAlt={"trash"}
                buttonSize={{width: 30, height: 30}}
                padding={15}
                onClick={onReject}
            />
        </>}
    </div>
};

const mapDispatchToProps = {
    updatePreventCustomCursorStatus,
    updateTextImageDataById
};

const mapStateToProps = (state: AppState) => ({
    activeTextId: state.texts.activeTextId,
    highlightedTextId: state.texts.highlightedTextId,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TextControlPanel);