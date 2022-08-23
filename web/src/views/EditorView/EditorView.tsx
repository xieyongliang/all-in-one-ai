import React from 'react';
import './EditorView.scss';
import EditorContainer from './EditorContainer/EditorContainer';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {AppState} from '../../store';
import {connect} from 'react-redux';
import classNames from 'classnames';

interface IProps {
    activePopupType: PopupWindowType;
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    imageColors: string[];
    imageLabels: string[];
    imageAnnotations?: string[];
    imageNames: string[];
    onLoaded: () => any;
    onClosed: () => any;
}

const EditorView: React.FC<IProps> = (
    {
        activePopupType,
        imageBuckets,
        imageKeys,
        imageId,
        imageColors,
        imageLabels,
        imageAnnotations,
        imageNames,
        onLoaded,
        onClosed
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
                imageBuckets = {imageBuckets} 
                imageKeys = {imageKeys} 
                imageId = {imageId} 
                imageColors = {imageColors} 
                imageLabels= {imageLabels} 
                imageAnnotations= {imageAnnotations}
                imageNames = {imageNames}
                onLoaded = {onLoaded}
                onClosed = {onClosed}
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
