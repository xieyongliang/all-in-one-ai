import React from 'react';
import {ISize} from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import './RectTextsList.scss';
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import TextInputField from '../TextInputField/TextInputField';
import {ImageTextData, TextRect} from "../../../../store/texts/types";
import {
    updateImageTextDataById
} from "../../../../store/texts/actionCreators";

interface IProps {
    size: ISize;
    imageData: ImageTextData;
    activeTextId: string;
    updateImageTextDataById: (id: string, newImageData: ImageTextData) => any;
}

const RectLabelsList: React.FC<IProps> = ({size, imageData, activeTextId, updateImageTextDataById}) => {
    const textInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.textRects.length * textInputFieldHeight
    };

    const deleteRectLabelById = (textRectId: string) => {
        LabelActions.deleteRectLabelById(imageData.id, textRectId);
    };

    const updateRectText = (textRectId: string, textNameId: string) => {
        const newImageData = {
            ...imageData,
            textRects: imageData.textRects
                .map((textRect: TextRect) => {
                return textRect
            })
        };
        updateImageTextDataById(imageData.id, newImageData);
    };

    const onClickHandler = () => {
    };

    const getChildren = () => {
        return imageData.textRects
            .map((textRect: TextRect) => {
            return <TextInputField
                size={{
                    width: size.width,
                    height: textInputFieldHeight
                }}
                id={textRect.id}
                key={textRect.id}
                isActive={textRect.id === activeTextId}
                onDelete={deleteRectLabelById}
                value={textRect.text}
                onChange={updateRectText}
            />
        });
    };

    return (
        <div
            className="RectTextsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            <Scrollbars>
                <div
                    className="RectTextsListContent"
                    style={listStyleContent}
                >
                    {getChildren()}
                </div>
            </Scrollbars>
        </div>
    );
};

const mapDispatchToProps = {
    updateImageTextDataById
};

const mapStateToProps = (state: AppState) => ({
    activeTextId: state.texts.activeTextId
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectLabelsList);