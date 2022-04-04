import {ContextType} from '../../../data/enums/ContextType';
import './EditorTopNavigationBar.scss';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import {updateActivePopupType, updateCrossHairVisibleStatus, updateImageDragModeStatus, updatePerClassColorationStatus, updateProjectData} from '../../../store/general/actionCreators';
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
import { Select } from 'aws-northstar';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { PathParams } from '../../../components/Interfaces/PathParams';
import { SelectOption } from 'aws-northstar/components/Select';
import { ImageData, LabelName } from '../../../store/labels/types';
import { addImageData, updateActiveImageIndex, updateActiveLabelNameId, updateActiveLabelType, updateFirstLabelCreatedFlag, updateImageData, updateLabelNames } from '../../../store/labels/actionCreators';
import { ProjectData } from '../../../store/general/types';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { ImporterSpecData } from '../../../data/ImporterSpecData';
import { AnnotationFormatType } from '../../../data/enums/AnnotationFormatType';

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

const getButtonWithTooltip = (
    key: string,
    tooltipMessage: string,
    imageSrc: string,
    imageAlt: string,
    isActive: boolean,
    href?:string,
    onClick?:() => any
): React.ReactElement => {
    return <StyledTooltip
        key={key}
        disableFocusListener={true}
        title={tooltipMessage}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 600 }}
        placement='bottom'
    >
        <div>
            <ImageButton
                buttonSize={BUTTON_SIZE}
                padding={BUTTON_PADDING}
                image={imageSrc}
                imageAlt={imageAlt}
                href={href}
                onClick={onClick}
                isActive={isActive}
            />
        </div>
    </StyledTooltip>
}

interface IProps {
    activeContext: ContextType;
    updateImageDragModeStatusAction: (imageDragMode: boolean) => any;
    updateCrossHairVisibleStatusAction: (crossHairVisible: boolean) => any;
    updateActiveImageIndexAction: (activeImageIndex: number) => any;
    addImageDataAction: (imageData: ImageData[]) => any;
    updateProjectDataAction: (projectData: ProjectData) => any;
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateImageDataAction: (imageData: ImageData[]) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updateActiveLabelTypeAction: (activeLabelType: LabelType) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
    updateActiveImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateImageData: (imageData: ImageData[]) => any;
    updateFirstLabelCreatedFlag: (firstLabelCreatedFlag: boolean) => any;
    updateProjectData: (projectData: ProjectData) => any;
    updateLabels: (labels: LabelName[]) => any;
    imageDragMode: boolean;
    crossHairVisible: boolean;
    activeLabelType: LabelType;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageLabels: string[];
    imageColors: string[];
    imageAnnotations?: string[];
}

const EditorTopNavigationBar: React.FC<IProps> = (
    {
        activeContext,
        updateImageDragModeStatusAction,
        updateCrossHairVisibleStatusAction,
        updateImageDataAction,
        updateLabelNamesAction,
        updateActiveLabelTypeAction,
        updateLabels,
        imageDragMode,
        crossHairVisible,
        activeLabelType,
        imageBucket,
        imageKey,
        imageId,
        imageLabels,
        imageColors,
        imageAnnotations
    }) => {
    const [ endpointOptions, setEndpointOptions ] = useState([])
    const [ selectedEndpoint, setSelectedEndpoint ] = useState<SelectOption>({})
    const [ computedAnnotations ] = useState<string[]>(imageAnnotations !== undefined ? imageAnnotations :[])

    var params : PathParams = useParams();
    
    const getClassName = () => {
        return classNames(
            'EditorTopNavigationBar',
            {
                'with-context': activeContext === ContextType.EDITOR
            }
        );
    };

    useEffect(() => {
        axios.get('/endpoint', {params: { industrial_model: params.id}})
            .then((response) => {
                var items = []
                response.data.forEach((item) => {
                    items.push({label: item.EndpointName, value: item.EndpointName})
                    if(items.length === response.data.length) {
                        setEndpointOptions(items)
                        setSelectedEndpoint(items[0])
                    }
                })
            }
        )
    }, [params.id]);

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

    const onAnnotationLoadSuccess = useCallback((imagesData: ImageData[], labelNames: LabelName[]) => {
        updateImageDataAction(imagesData);
        updateLabelNamesAction(labelNames);
        updateActiveLabelTypeAction(LabelType.RECT);
    
        computedAnnotations.forEach(annotation => {
            var number = annotation.split(' ');
            var id = parseInt(number[0]);
            labelNames[id % imageColors.length].color = imageColors[id % imageColors.length];
            labelNames[id].name = imageLabels[id];
        });

        updateLabels(labelNames);
    }, [ computedAnnotations, imageColors, imageLabels, updateActiveLabelTypeAction, updateImageDataAction, updateLabelNamesAction, updateLabels]);

    const onAnnotationsLoadFailure = (error?:Error) => {    
        console.log(error)
    };

    const getInference = async () => {
        var response = undefined
        if(imageBucket !== undefined && imageKey!== undefined)
            response = await axios.get('/inference/sample', { params : { endpoint_name: selectedEndpoint.value, bucket: imageBucket, key: imageKey } })
        else if(imageId !== undefined)
            response = await axios.get(`/inference/image/${imageId}`, { params : { endpoint_name: selectedEndpoint.value, bucket: imageBucket, key: imageKey } })
        if(response === undefined)
            return response
        else
            return response.data
    }

    const importAnnotations = useCallback(() => {
        var labelsFile = new File(imageLabels, 'labels.txt');
        var annotationFile = new File(computedAnnotations, 'image.txt');
                    
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        importer.import([labelsFile, annotationFile], onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
    }, [ computedAnnotations, imageLabels, onAnnotationLoadSuccess ]);

    useEffect(() => {
        const timeout = setTimeout(() => {
        if(computedAnnotations !== undefined)
            importAnnotations();
        }, 1000);
        return () => clearTimeout(timeout);
    }, [ computedAnnotations, importAnnotations ]);

    const inferenceOnClick = () => {
        var promise = getInference()
        if(promise !== undefined)
            promise.then(data => {
                var imageBboxs : number[][] = [];
                var imageIds : number[] = [];
                for(let item of data) {
                    var numbers = item.split(' ');
                    imageIds.push(parseInt(item[0]));
                    var box : number[] = [];
                    box.push(parseFloat(numbers[1]));
                    box.push(parseFloat(numbers[2]));
                    box.push(parseFloat(numbers[3]));
                    box.push(parseFloat(numbers[4]));
                    imageBboxs.push(box);
                }
                var index = 0;
                computedAnnotations.slice(0, computedAnnotations.length)
                imageBboxs.forEach(item => {
                    var annotation : string = imageIds[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
                    computedAnnotations.push(annotation);
                    index++;
                });
                
                importAnnotations();

            }, (error) => {
                console.log(error);
            });
    }

    return (
        <div className={getClassName()}>
            <div className='ButtonWrapper'>
                {
                    getButtonWithTooltip(
                        'zoom-in',
                        'zoom in',
                        '/ico/zoom-in.png',
                        'zoom-in',
                        false,
                        undefined,
                        () => ViewPortActions.zoomIn()
                    )
                }
                {
                    getButtonWithTooltip(
                        'zoom-out',
                        'zoom out',
                        '/ico/zoom-out.png',
                        'zoom-out',
                        false,
                        undefined,
                        () => ViewPortActions.zoomOut()
                    )
                }
                {
                    getButtonWithTooltip(
                        'zoom-fit',
                        'fit image to available space',
                        '/ico/zoom-fit.png',
                        'zoom-fit',
                        false,
                        undefined,
                        () => ViewPortActions.setDefaultZoom()
                    )
                }
                {
                    getButtonWithTooltip(
                        'zoom-max',
                        'maximum allowed image zoom',
                        '/ico/zoom-max.png',
                        'zoom-max',
                        false,
                        undefined,
                        () => ViewPortActions.setOneForOneZoom()
                    )
                }
            </div>
            <div className='ButtonWrapper'>
                {
                    getButtonWithTooltip(
                        'image-drag-mode',
                        imageDragMode ? 'turn-off image drag mode' : 'turn-on image drag mode - works only when image is zoomed',
                        '/ico/hand.png',
                        'image-drag-mode',
                        imageDragMode,
                        undefined,
                        imageDragOnClick
                    )
                }
                {
                    getButtonWithTooltip(
                        'cursor-cross-hair',
                        crossHairVisible ? 'turn-off cursor cross-hair' : 'turn-on cursor cross-hair',
                        '/ico/cross-hair.png',
                        'cross-hair',
                        crossHairVisible,
                        undefined,
                        crossHairOnClick
                    )
                }
                {
                    (imageId !== undefined || (imageBucket !== undefined && imageKey !== undefined)) &&
                    <Select 
                        placeholder='Choose an endpoint'
                        selectedOption={selectedEndpoint}
                        options={endpointOptions}
                    >
                    </Select>}

                {
                    (imageId !== undefined || (imageBucket !== undefined && imageKey !== undefined)) &&
                    getButtonWithTooltip(
                        'prediction',
                        'inference image to get prediction',
                        '/ico/prediction.png',
                        'prediction',
                        true,
                        undefined,
                        inferenceOnClick
                    )
                }
            </div>
            {((activeLabelType === LabelType.RECT && AISelector.isAIObjectDetectorModelLoaded()) ||
                (activeLabelType === LabelType.POINT && AISelector.isAIPoseDetectorModelLoaded())) && <div className='ButtonWrapper'>
                {
                    getButtonWithTooltip(
                        'accept-all',
                        'accept all proposed detections',
                        '/ico/accept-all.png',
                        'accept-all',
                        false,
                        undefined,
                        () => AIActions.acceptAllSuggestedLabels(LabelsSelector.getActiveImageData())
                    )
                }
                {
                    getButtonWithTooltip(
                        'reject-all',
                        'reject all proposed detections',
                        '/ico/reject-all.png',
                        'reject-all',
                        false,
                        undefined,
                        () => AIActions.rejectAllSuggestedLabels(LabelsSelector.getActiveImageData())
                    )
                }
            </div>}
        </div>
    )
};

const mapDispatchToProps = {
    updateImageDragModeStatusAction: updateImageDragModeStatus,
    updateCrossHairVisibleStatusAction: updateCrossHairVisibleStatus,
    updateActiveImageIndexAction: updateActiveImageIndex,
    addImageDataAction: addImageData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType,
    updateImageDataAction: updateImageData,
    updateLabelNamesAction: updateLabelNames,
    updateActiveLabelTypeAction: updateActiveLabelType,
    updatePerClassColorationStatusAction: updatePerClassColorationStatus,
    updateActiveLabelNameId,
    updateLabelNames,
    updateProjectData,
    updateActiveImageIndex,
    updateImageData,
    updateFirstLabelCreatedFlag,
    updateLabels: updateLabelNames
};

const mapStateToProps = (state: AppState) => ({
    activeContext: state.general.activeContext,
    imageDragMode: state.general.imageDragMode,
    crossHairVisible: state.general.crossHairVisible,
    activeLabelType: state.labels.activeLabelType
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorTopNavigationBar);
