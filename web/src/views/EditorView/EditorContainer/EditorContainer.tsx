import React, {useState} from 'react';
import {connect} from "react-redux";
import {Direction} from "../../../data/enums/Direction";
import {ISize} from "../../../interfaces/ISize";
import {Settings} from "../../../settings/Settings";
import {AppState} from "../../../store";
import {ImageLabelData} from "../../../store/labels/types";
import ImagesList from "../SideNavigationBar/ImagesList/ImagesList";
import LabelsToolkit from "../SideNavigationBar/LabelsToolkit/LabelsToolkit";
import {SideNavigationBar} from "../SideNavigationBar/SideNavigationBar";
import {VerticalEditorButton} from "../VerticalEditorButton/VerticalEditorButton";
import './EditorContainer.scss';
import Editor from "../Editor/Editor";
import {ContextManager} from "../../../logic/context/ContextManager";
import {ContextType} from "../../../data/enums/ContextType";
import EditorBottomNavigationBar from "../EditorBottomNavigationBar/EditorBottomNavigationBar";
import EditorTopNavigationBar from "../EditorTopNavigationBar/EditorTopNavigationBar";
import {ProjectType} from "../../../data/enums/ProjectType";
import TextsToolkit from '../SideNavigationBar/TextsToolkit/TextsToolkit';
import { ImageTextData } from '../../../store/texts/types';
import { Box, Dialog } from '@material-ui/core';
import { LoadingIndicator } from 'aws-northstar';

interface IProps {
    windowSize: ISize;
    activeLabelImageIndex: number;
    activeTextImageIndex: number;
    imagesLabelData: ImageLabelData[];
    imagesTextData: ImageTextData[];
    activeContext: ContextType;
    projectType: ProjectType;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageLabels: string[];
    imageColors: string[];
    imageAnnotations?: string[];
    imageName: string;
}

const EditorContainer: React.FC<IProps> = (
    {
        windowSize,
        activeLabelImageIndex,
        activeTextImageIndex,
        imagesLabelData,
        imagesTextData,
        activeContext,
        projectType,
        imageBucket,
        imageKey,
        imageId,
        imageLabels,
        imageColors,
        imageAnnotations,
        imageName
    }) => {
    const [ leftTabStatus, setLeftTabStatus ] = useState(true);
    const [ rightTabStatus, setRightTabStatus ] = useState(true);
    const [ processing, setProcessing ] = useState(false);

    const calculateEditorSize = (): ISize => {
        if (windowSize) {
            const leftTabWidth = leftTabStatus ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            const rightTabWidth = rightTabStatus ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            return {
                width: windowSize.width - leftTabWidth - rightTabWidth,
                height: windowSize.height - Settings.TOP_NAVIGATION_BAR_HEIGHT_PX
                    - Settings.EDITOR_BOTTOM_NAVIGATION_BAR_HEIGHT_PX - Settings.EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX,
            }
        }
        else
            return null;
    };

    const leftSideBarButtonOnClick = () => {
        if (!leftTabStatus)
            ContextManager.switchCtx(ContextType.LEFT_NAVBAR);
        else if (leftTabStatus && activeContext === ContextType.LEFT_NAVBAR)
            ContextManager.restoreCtx();

        setLeftTabStatus(!leftTabStatus);
    };

    const leftSideBarCompanionRender = () => {
        return <>
            <VerticalEditorButton
                label="Images"
                image={"/ico/camera.png"}
                imageAlt={"images"}
                onClick={leftSideBarButtonOnClick}
                isActive={leftTabStatus}
            />
        </>
    };

    const leftSideBarRender = () => {
        return <ImagesList/>
    };

    const rightSideBarButtonOnClick = () => {
        if (!rightTabStatus)
            ContextManager.switchCtx(ContextType.RIGHT_NAVBAR);
        else if (rightTabStatus && activeContext === ContextType.RIGHT_NAVBAR)
            ContextManager.restoreCtx();

        setRightTabStatus(!rightTabStatus);
    };

    const rightSideBarCompanionRender = () => {
        return <>
            <VerticalEditorButton
                label="Labels"
                image={"/ico/tags.png"}
                imageAlt={"labels"}
                onClick={rightSideBarButtonOnClick}
                isActive={rightTabStatus}
            />
        </>
    };

    const rightSideBarRender = () => {
        if(projectType === ProjectType.TEXT_RECOGNITION) 
            return <TextsToolkit 
                imageBucket = {imageBucket}
                imageKey = {imageKey}
                imageId = {imageId}
                onProcessing = {onProcessing} 
                onProcessed = {onProcessed}
            />
        else
            return <LabelsToolkit
                imageBucket = {imageBucket}
                imageKey = {imageKey}
                imageId = {imageId}
                imageColors = {imageColors}
                imageLabels = {imageLabels}
                imageName = {imageName}
                imageAnnotations = {imageAnnotations}
                onProcessing = {onProcessing} 
                onProcessed = {onProcessed}
            />
    };

    var imagesData = projectType === ProjectType.TEXT_RECOGNITION ? imagesTextData : imagesLabelData
    var activeImageIndex = projectType === ProjectType.TEXT_RECOGNITION ? activeTextImageIndex : activeLabelImageIndex
 
    const onProcessing = () => {
        setProcessing(true);
    }

    const onProcessed = () => {
        setProcessing(false);
    }

    return (
        <div className="EditorContainer">
            <SideNavigationBar
                direction={Direction.LEFT}
                isOpen={leftTabStatus}
                isWithContext={activeContext === ContextType.LEFT_NAVBAR}
                renderCompanion={leftSideBarCompanionRender}
                renderContent={leftSideBarRender}
                key="left-side-navigation-bar"
            />
            <div className="EditorWrapper"
                onMouseDown={() => ContextManager.switchCtx(ContextType.EDITOR)}
                 key="editor-wrapper"
            >
                {
                    (
                        projectType === ProjectType.TEXT_RECOGNITION ||
                        projectType === ProjectType.OBJECT_DETECTION ||
                        projectType === ProjectType.OBJECT_DETECTION_RECT || 
                        projectType === ProjectType.OBJECT_DETECTION_POINT ||
                        projectType === ProjectType.OBJECT_DETECTION_LINE ||
                        projectType === ProjectType.OBJECT_DETECTION_POLYGON
                    )   && 
                    <EditorTopNavigationBar 
                        key="editor-top-navigation-bar"
                    />
                }
                {
                    processing && <Dialog open={true}>
                        <Box p={3}>
                            <LoadingIndicator label='Processing...'/>
                        </Box>
                    </Dialog>

                }
                <Editor
                    size={calculateEditorSize()}
                    imageData={imagesData[activeImageIndex]}
                    key="editor"
                />
                <EditorBottomNavigationBar
                    imageData={imagesData[activeImageIndex]}
                    size={calculateEditorSize()}
                    totalImageCount={imagesData.length}
                    key="editor-bottom-navigation-bar"
                />
            </div>
            <SideNavigationBar
                direction={Direction.RIGHT}
                isOpen={rightTabStatus}
                isWithContext={activeContext === ContextType.RIGHT_NAVBAR}
                renderCompanion={rightSideBarCompanionRender}
                renderContent={rightSideBarRender}
                key="right-side-navigation-bar"
            />
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    windowSize: state.general.windowSize,
    activeLabelImageIndex: state.labels.activeImageIndex,
    activeTextImageIndex: state.texts.activeImageIndex,
    imagesLabelData: state.labels.imagesData,
    imagesTextData: state.texts.imagesData,
    activeContext: state.general.activeContext,
    projectType: state.general.projectData.type
});

export default connect(
    mapStateToProps
)(EditorContainer);