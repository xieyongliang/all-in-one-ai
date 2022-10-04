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
import { AnnotationFormatType, ExportDataFormatType } from '../../../data/enums/AnnotationFormatType';
import { RectLabelsExporter } from '../../../logic/export/RectLabelsExporter';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { PolygonTextsExporter } from '../../../logic/export/polygon/PolygonTextsExporter';
import { ImporterSpecData } from '../../../data/ImporterSpecData';
import { store } from '../../..';
import { LabelImageData, LabelName } from '../../../store/labels/types';
import { updateActiveLabelType, updateLabelImageData, updateLabelNames } from '../../../store/labels/actionCreators';
import JSZip from 'jszip';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../../components/Utils/Helper';
import { GenericImageExporter } from '../../../logic/export/GenericImageExporter';
import { GenericImageImporter } from '../../../logic/import/GenericImageImporter';

const BUTTON_SIZE: ISize = {width: 30, height: 30};
const BUTTON_PADDING: number = 10;
const zip = new JSZip();

const StyledTooltip = withStyles(theme => ({
    tooltip: {
        backgroundColor: '#171717',
        color: '#ffffff',
        boxShadow: theme.shadows[1],
        fontSize: 12,
        maxWidth: 200,
        textAlign: 'center',
        zIndex: 5000
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
    activeContext: ContextType;
    imageDragMode: boolean;
    crossHairVisible: boolean;
    activeLabelType: LabelType;
    projectType: ProjectType;
    projectSubType: ProjectSubType;
    imageBuckets: string[];
    imageKeys: string[];
    imageLabels: string[];
    imageColors: string[];
    updateLabelImageData: (imagesData) => any;
    updateLabelNames: (labelNames) => any;
    updateActiveLabelType : (LabelType) => any;
    onProcessing: () => any;
    onProcessed: () => any;
    onClosed: () => any;
}

const EditorTopNavigationBar: React.FC<IProps> = (
    {
        updateImageDragModeStatusAction,
        updateCrossHairVisibleStatusAction,
        activeContext,
        imageDragMode,
        crossHairVisible,
        activeLabelType,
        projectType,
        projectSubType,
        imageBuckets,
        imageKeys,
        imageLabels,
        imageColors,
        updateLabelImageData,
        updateLabelNames,
        updateActiveLabelType,
        onProcessing,
        onProcessed,
        onClosed
    }) => {
    const { t } = useTranslation();

    if(projectType === ProjectType.IMAGE_GENERIC)
        updateCrossHairVisibleStatusAction(false);

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
        if(projectType === ProjectType.IMAGE_GENERIC)
            GenericImageExporter.export(AnnotationFormatType.RANK)
        else if(projectType === ProjectType.TEXT_RECOGNITION)
            PolygonTextsExporter.export(AnnotationFormatType.PPOCR)
        else
            RectLabelsExporter.export(AnnotationFormatType.YOLO)
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
        onProcessed();
    }, [ imageAnnotations, imageColors, imageLabels, updateActiveLabelType, updateLabelImageData, updateLabelNames, onProcessed]);
    
    const onAnnotationsLoadFailure = useCallback((error?:Error) => {    
        logOutput('alert', error, undefined, error);
        onProcessed();
    }, [onProcessed]);
    
    const importImageRank = useCallback((file, content) => {
        var importer = new GenericImageImporter();
        if(file.name.endsWith('.txt')) {
            importer.import(file.name, content)
        }
        else if(file.name.endsWith('.zip')) {
            zip.loadAsync(file).then(function(zip) {
                var num_total = Object.keys(zip.files).length
                var num_completed = 0;
                onProcessing();
                zip.forEach(function (filename, zipEntry) {
                    zipEntry.async('blob').then((fileData) => {
                        fileData.text().then((data) => {
                            importer.import(filename, data);
                            num_completed++;
                            if(num_completed === num_total)
                                onProcessed();
                        })
                    })
                });
            }, function (e) {
                logOutput('alert', t('unzip_error'), undefined, e);
            });
        }
    }, [onProcessed, onProcessing, t])

    const importImageAnnotations = useCallback((file) => {
        var labelsFile = new File(imageLabels, 'labels.txt');
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        if(file.name.endsWith('.txt'))
            importer.import([labelsFile, file], onAnnotationLoadSuccess, onAnnotationsLoadFailure);
        else if(file.name.endsWith('.zip')) {
            zip.loadAsync(file).then(function(zip) {
                var files = [labelsFile];
                var num_total = Object.keys(zip.files).length
                var num_completed = 0;
                onProcessing();
                zip.forEach(function (filename, zipEntry) {
                    zipEntry.async('blob').then((fileData) => {
                        fileData.text().then((data) => {
                            files.push(new File([fileData], filename))
                            num_completed++;
                            if(num_completed === num_total)
                                importer.import(files, onAnnotationLoadSuccess, onAnnotationsLoadFailure);
                        })
                    })
                });
            }, function (e) {
                logOutput('alert', t('unzip_error'), undefined, e);
            });
        }
    }, [ imageLabels, t, onAnnotationLoadSuccess, onAnnotationsLoadFailure, onProcessing ]);
    
    const onFileSelect = (file) => {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (event) {
            var content = event.target.result as string;
            if(projectType === ProjectType.IMAGE_GENERIC) {
                importImageRank(file, content)
            }
            else
            {
                setImageAnnotations(content.split(/\r\n|\n/));
                importImageAnnotations(file);
            }
        }
    }

    const onUpload = () => {
        var outputs = RectLabelsExporter.exportData(ExportDataFormatType.YOLOData, imageBuckets, imageKeys)
        var promises = []

        outputs.forEach((output) => {
            var bucket = output['bucket']
            var key = output['key']
            var data = output['data']
            if(data)
                promises.push(axios.post('/annotation', output));
            else
                promises.push(axios.delete('/annotation', {params: { bucket: bucket, key: key}}))            
        })
        var num_completed = 0;
        var num_total = promises.length;
        onProcessing()
        Promise.all(promises).then((reponses) => {
            reponses.forEach((response) => {
                num_completed++;
                if(num_completed === num_total)
                    onProcessed();
            })
        })
    }

    return (
        <div className={getClassName()}>
            <div className='ButtonWrapper'>
                    <ButtonWithTooltip
                        key = 'zoom-in'
                        tooltipMessage = 'zoom in'
                        imageSrc = '/ico/zoom-in.png'
                        imageAlt = {t('industrial_models.demo.zoom_in')}
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.zoomIn}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-out'
                        tooltipMessage = 'zoom out'
                        imageSrc = '/ico/zoom-out.png'
                        imageAlt = {t('industrial_models.demo.zoom_out')}
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.zoomOut}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-fit'
                        tooltipMessage = 'fit image to available space'
                        imageSrc = '/ico/zoom-fit.png'
                        imageAlt = {t('industrial_models.demo.zoom_fit')}
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.setDefaultZoom}
                    />
                    <ButtonWithTooltip
                        key = 'zoom-max'
                        tooltipMessage = 'maximum allowed image zoom'
                        imageSrc = '/ico/zoom-max.png'
                        imageAlt = {t('industrial_models.demo.zoom_max')}
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {ViewPortActions.setOneForOneZoom}
                    />
            </div>
            <div className='ButtonWrapper'>
                <ButtonWithTooltip
                    key = 'image-drag-mode'
                    tooltipMessage = {imageDragMode ? t('industrial_models.demo.turn_off_image_drag_mode') : t('industrial_models.demo.turn_on_image_drag_mode')}
                    imageSrc = '/ico/hand.png'
                    imageAlt = {t('industrial_models.demo.image_drag_mode')}
                    isActive = {false}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {imageDragOnClick}
                />
                <ButtonWithTooltip
                    key = 'cursor-cross-hair'
                    tooltipMessage = {crossHairVisible ? t('industrial_models.demo.turn_off_cursor_cross_hair') : t('industrial_models.demo.turn_on_cursor_cross_hair')}
                    imageSrc = '/ico/cross-hair.png'
                    imageAlt = {t('industrial_models.demo.cursor_cross_hair')}
                    isActive = {crossHairVisible}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {crossHairOnClick}
                />
                <ButtonWithTooltip
                    key = 'export-annotations'
                    tooltipMessage = {t('industrial_models.demo.export_annotation')}
                    imageSrc = '/ico/export-labels.png'
                    imageAlt = {t('industrial_models.demo.export_annotation')}
                    isActive = {false}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {exportOnClick}
                />
                <ButtonWithTooltip
                    key = 'import-annotations'
                    tooltipMessage = {t('industrial_models.demo.import_annotation')}
                    imageSrc = '/ico/import-labels.png'
                    imageAlt = {t('industrial_models.demo.import_annotation')}
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
            {
                projectType === ProjectType.OBJECT_DETECTION_RECT && projectSubType === ProjectSubType.BATCH_OBJECT_DETECTION && imageBuckets !== undefined && imageKeys !== undefined &&
                <div className='ButtonWrapper'>
                    <ButtonWithTooltip
                        key = 'upload'
                        tooltipMessage = {t('industrial_models.demo.upload')}
                        imageSrc = '/ico/upload.png'
                        imageAlt = {t('industrial_models.demo.upload')}
                        isActive = {false}
                        fileMode = {false}
                        href = {undefined}
                        onClick = {onUpload}
                    />
                </div>
            }
            <div className='ButtonWrapper'>
                <ButtonWithTooltip
                    key = 'exit'
                    tooltipMessage = {t('industrial_models.demo.exit')}
                    imageSrc = '/ico/exit.png'
                    imageAlt = {t('industrial_models.demo.exit')}
                    isActive = {false}
                    fileMode = {false}
                    href = {undefined}
                    onClick = {onClosed}
                />
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
    projectSubType: state.general.projectData.subType,
    activeImageIndex: state.labels.activeImageIndex
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorTopNavigationBar);
