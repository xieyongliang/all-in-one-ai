import {ContextType} from '../../../data/enums/ContextType';
import './EditorTopNavigationBar.scss';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import { updateCrossHairVisibleStatus, updateImageDragModeStatus } from '../../../store/general/actionCreators';
import {GeneralSelector} from '../../../store/selectors/GeneralSelector';
import {ViewPointSettings} from '../../../settings/ViewPointSettings';
import {ImageButton} from '../../Common/ImageButton/ImageButton';
import {ViewPortActions} from '../../../logic/actions/ViewPortActions';
import {LabelsSelector} from '../../../store/selectors/LabelsSelector';
import {LabelType} from '../../../data/enums/LabelType';
import {AISelector} from '../../../store/selectors/AISelector';
import {ISize} from '../../../interfaces/ISize';
import {AIActions} from '../../../logic/actions/AIActions';
import withStyles from '@material-ui/core/styles/withStyles';
import {Tooltip} from '@material-ui/core';
import Fade from '@material-ui/core/Fade';
import { AnnotationFormatType } from '../../../data/enums/AnnotationFormatType';
import { RectLabelsExporter } from '../../../logic/export/RectLabelsExporter';
import { ProjectType } from '../../../data/enums/ProjectType';
import { PolygonTextsExporter } from '../../../logic/export/polygon/PolygonTextsExporter';
import { ImporterSpecData } from '../../../data/ImporterSpecData';
import { store } from '../../..';
import { LabelImageData, LabelName } from '../../../store/labels/types';
import { updateActiveLabelType, updateLabelImageData, updateLabelNames } from '../../../store/labels/actionCreators';

const BUTTON_SIZE: ISize = {width: 30, height: 30};
const BUTTON_PADDING: number = 10;

const StyledTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: '#171717',
        color: '#ffffff',
        boxShadow: theme.shadows[1],
        fontSize: 12,
        maxWidth: 200,
        textAlign: 'center'
    },
}))(Tooltip);

interface TooltipIProps {
    key: string,
    tooltipMessage: string,
    imageSrc: string,
    imageAlt: string,
    isActive: boolean,
    fileMode?: boolean,
    href?:string,
    onClick?:() => any,
    onFileSelect?:(file)=>any
}

const ButtonWithTooltip : React.FunctionComponent<TooltipIProps> = ({
    key,
    tooltipMessage,
    imageSrc,
    imageAlt,
    isActive,
    fileMode,
    href,
    onClick,
    onFileSelect
}) => {
    const fileInput = useRef(null)
    
    return <StyledTooltip
        key={key}
        disableFocusListener={true}
        title={tooltipMessage}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
        placement='bottom'
    >        
        <div>
            {
                fileMode !== undefined && fileMode && 
                <input 
                    type='file' 
                    style={{display:'none'}} 
                    onChange={(e) => {if(e.target.files.length > 0) onFileSelect(e.target.files[0])}}
                    ref = {fileInput}
                />
            }
            {
                (fileMode === undefined || !fileMode) &&
                <ImageButton
                    buttonSize={BUTTON_SIZE}
                    padding={BUTTON_PADDING}
                    image={imageSrc}
                    imageAlt={imageAlt}
                    href={href}
                    onClick={onClick}
                    isActive={isActive}
                />
            }
            {
                (fileMode !== undefined && fileMode) &&
                <ImageButton
                    buttonSize={BUTTON_SIZE}
                    padding={BUTTON_PADDING}
                    image={imageSrc}
                    imageAlt={imageAlt}
                    href={href}
                    onClick={() => fileInput.current && fileInput.current.click()}
                    isActive={isActive}
                />
            }
        </div>
    </StyledTooltip>
}

interface IProps {
    updateImageDragModeStatusAction: (imageDragMode: boolean) => any;
    updateCrossHairVisibleStatusAction: (crossHairVisible: boolean) => any;
    key : string;
    activeContext: ContextType;
    imageDragMode: boolean;
    crossHairVisible: boolean;
    activeLabelType: LabelType;
    projectType: ProjectType;
    projectName: string;
    imageLabels: string[];
    imageColors: string[];
    imageName: string;
    updateLabelImageData: (imagesData) => any;
    updateLabelNames: (labelNames) => any;
    updateActiveLabelType : (LabelType) => any;
}

const EditorTopNavigationBar: React.FC<IProps> = (
    {
        updateImageDragModeStatusAction,
        updateCrossHairVisibleStatusAction,
        key,
        activeContext,
        imageDragMode,
        crossHairVisible,
        activeLabelType,
        projectType,
        projectName,
        imageLabels,
        imageColors,
        imageName,
        updateLabelImageData,
        updateLabelNames,
        updateActiveLabelType
    }) => {
    const [ imageAnnotations, setImageAnnotations ] = useState([])

    const getClassName = () => {
        return classNames(
            'EditorTopNavigationBar',
            {
                'with-context': activeContext === ContextType.EDITOR
            }
        );
    };

    const imageDragOnClick = () => {
        if (imageDragMode) {
            updateImageDragModeStatusAction(!imageDragMode);
        }
        else if (GeneralSelector.getZoom() !== ViewPointSettings.MIN_ZOOM) {
            updateImageDragModeStatusAction(!imageDragMode);
        }
    };

    const crossHairOnClick = () => {
        updateCrossHairVisibleStatusAction(!crossHairVisible);
    }

    const exportOnClick = () => {
        if(projectType !== ProjectType.TEXT_RECOGNITION)
            RectLabelsExporter.export(AnnotationFormatType.YOLO)
        else
            PolygonTextsExporter.export(AnnotationFormatType.PPOCR)
    }

    const onAnnotationLoadSuccess = useCallback((imagesData: LabelImageData[], labelNames: LabelName[]) => {
        store.dispatch(updateLabelImageData(imagesData));
        store.dispatch(updateLabelNames(labelNames));
        store.dispatch(updateActiveLabelType(LabelType.RECT));
    
        imageAnnotations.forEach(annotation => {
            var number = annotation.split(' ');
            var id = parseInt(number[0]);
            labelNames[id % imageColors.length].color = imageColors[id % imageColors.length];
            labelNames[id].name = imageLabels[id];
        });
    
        store.dispatch(updateLabelNames(labelNames));
    }, [ imageAnnotations, imageColors, imageLabels, updateActiveLabelType, updateLabelImageData, updateLabelNames]);
    
    const onAnnotationsLoadFailure = (error?:Error) => {    
        console.log(error)
    };
    
    const importAnnotations = useCallback((annotationFile) => {
        var labelsFile = new File(imageLabels, 'labels.txt');
        
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        importer.import([labelsFile, annotationFile], onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
    }, [ imageLabels, onAnnotationLoadSuccess ]);
    
    const onFileSelect = (file) => {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (event) {
            var content = event.target.result as string
            setImageAnnotations(content.split(/\r\n|\n/))
        }
        importAnnotations(file)
    }

    return (
        <div className={getClassName()}>
            <div className='ButtonWrapper'>
                    <ButtonWithTooltip
                        key = 'zoom-in'
                        tooltipMessage = 'zoom in'
                        imageSrc = '/ico/zoom-in.png'
                        imageAlt = 'zoom-in'
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.zoomIn}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-out'
                        tooltipMessage = 'zoom out'
                        imageSrc = '/ico/zoom-out.png'
                        imageAlt = 'zoom-out'
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.zoomOut}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-fit'
                        tooltipMessage = 'fit image to available space'
                        imageSrc = '/ico/zoom-fit.png'
                        imageAlt = 'zoom-fit'
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.setDefaultZoom}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-max'
                        tooltipMessage = 'maximum allowed image zoom'
                        imageSrc = '/ico/zoom-max.png'
                        imageAlt = 'zoom-max'
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.setOneForOneZoom}
                    />
            </div>
            <div className='ButtonWrapper'>
                <ButtonWithTooltip
                    key = 'image-drag-mode'
                    tooltipMessage = {imageDragMode ? 'turn-off image drag mode' : 'turn-on image drag mode - works only when image is zoomed'}
                    imageSrc = '/ico/hand.png'
                    imageAlt = 'image-drag-mode'
                    isActive = {false}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {imageDragOnClick}
                />
                <ButtonWithTooltip
                    key = 'cursor-cross-hair'
                    tooltipMessage = {crossHairVisible ? 'turn-off cursor cross-hair' : 'turn-on cursor cross-hair'}
                    imageSrc = '/ico/cross-hair.png'
                    imageAlt = 'cross-hair'
                    isActive = {crossHairVisible}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {crossHairOnClick}
                />
                <ButtonWithTooltip
                    key = 'export-annotations'
                    tooltipMessage = 'export annotations'
                    imageSrc = '/ico/export-labels.png'
                    imageAlt = 'export-annotations'
                    isActive = {false}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {exportOnClick}
                />
                <ButtonWithTooltip
                    key = 'import-annotations'
                    tooltipMessage = 'import annotations'
                    imageSrc = '/ico/import-labels.png'
                    imageAlt = 'import-annotations'
                    isActive = {false}
                    fileMode = {true}
                    href = {undefined}
                    onFileSelect = {onFileSelect}
                />
            </div>
            {
                ((activeLabelType === LabelType.RECT && AISelector.isAIObjectDetectorModelLoaded()) ||
                 (activeLabelType === LabelType.POINT && AISelector.isAIPoseDetectorModelLoaded())) && 
                    <div className='ButtonWrapper'>
                        <ButtonWithTooltip
                            key = 'accept-all'
                            tooltipMessage = 'accept all proposed detections'
                            imageSrc = '/ico/accept-all.png'
                            imageAlt = 'accept-all'
                            isActive = {false}
                            fileMode = {false}
                            href = {undefined}
                            onClick = {() => AIActions.acceptAllSuggestedLabels(LabelsSelector.getActiveImageData())}
                        />
                        <ButtonWithTooltip
                            key = 'reject-all'
                            tooltipMessage = 'reject all proposed detections'
                            imageSrc = '/ico/reject-all.png'
                            imageAlt = 'reject-all'
                            isActive = {false}
                            fileMode = {false}
                            href = {undefined}
                            onClick = {() => AIActions.rejectAllSuggestedLabels(LabelsSelector.getActiveImageData())}
                        />
                    </div>
            }
            <div className='ProjectName'>
                {projectName}
            </div>
        </div>
    )
};

const mapDispatchToProps = {
    updateImageDragModeStatusAction: updateImageDragModeStatus,
    updateCrossHairVisibleStatusAction: updateCrossHairVisibleStatus,
    updateLabelImageData,
    updateLabelNames,
    updateActiveLabelType
};

const mapStateToProps = (state: AppState) => ({
    activeContext: state.general.activeContext,
    imageDragMode: state.general.imageDragMode,
    crossHairVisible: state.general.crossHairVisible,
    activeLabelType: state.labels.activeLabelType,
    projectType: state.general.projectData.type,
    projectName: state.general.projectData.name
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorTopNavigationBar);
