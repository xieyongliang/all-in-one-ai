import React from 'react';
import './EditorView.scss';
import EditorContainer from './EditorContainer/EditorContainer';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {AppState} from '../../store';
import {connect} from 'react-redux';
import classNames from 'classnames';

interface IProps {
    activePopupType: PopupWindowType;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageColors: string[];
    imageLabels: string[];
    imageAnnotations?: string[];
    imageName: string;
}

const EditorView: React.FC<IProps> = (
    {
        activePopupType,
        imageBucket,
        imageKey,
        imageId,
        imageColors,
        imageLabels,
        imageAnnotations,
        imageName
    }) => {
    const getClassName = () => {
        return classNames(
            'EditorView',
            {
                'withPopup': !!activePopupType
            }
        );
    };

    return (
        <div
            className={getClassName()}
            draggable={false}
        >
            <EditorContainer 
                imageBucket = {imageBucket} 
                imageKey = {imageKey} 
                imageId = {imageId} 
                imageColors = {imageColors} 
                imageLabels= {imageLabels} 
                imageAnnotations= {imageAnnotations}
                imageName = {imageName}
            />
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    activePopupType: state.general.activePopupType
});

export default connect(
    mapStateToProps
)(EditorView);
