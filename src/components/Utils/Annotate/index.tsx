import React, { PropsWithChildren, useEffect, useState } from 'react';
import EditorView from '../../../views/EditorView/EditorView';
import {ProjectType} from '../../../data/enums/ProjectType';
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import PopupView from '../../../views/PopupView/PopupView';
import {ISize} from '../../../interfaces/ISize';
import classNames from 'classnames';
import { ProjectData } from '../../../store/general/types';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { addImageData, updateActiveImageIndex, updateActiveLabelType, updateImageData, updateLabelNames, updateActiveLabelNameId, updateFirstLabelCreatedFlag } from '../../../store/labels/actionCreators';
import { updateActivePopupType, updateProjectData } from '../../../store/general/actionCreators';
import {ImageData, LabelName} from '../../../store/labels/types';
import { ImageDataUtil } from '../../../utils/ImageDataUtil';
import axios from 'axios';
import { LabelType } from '../../../data/enums/LabelType';
import { AnnotationFormatType } from '../../../data/enums/AnnotationFormatType';
import { ImporterSpecData } from '../../../data/ImporterSpecData';

interface IProps {
    updateActiveImageIndexAction: (activeImageIndex: number) => any;
    addImageDataAction: (imageData: ImageData[]) => any;
    updateProjectDataAction: (projectData: ProjectData) => any;
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateImageDataAction: (imageData: ImageData[]) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updateActiveLabelTypeAction: (activeLabelType: LabelType) => any;
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    projectData: ProjectData;
    activeLabelType: LabelType;
    imageUri: string;
    labelsData: string[];
    annotationData: string[];
}

const ImageAnnotate: React.FC<IProps> = (props: PropsWithChildren<IProps>) => {
    const [importReady, setImportReady] = useState(false)
    const [imageReady, setImageReady] = useState(false)
    const formatType = AnnotationFormatType.YOLO
    const labelType = LabelType.RECT

    useEffect(() => {
        var imageFile : File;
        var labelsFile: File;
        var annotationFile: File;
        var isMounted = true;

        console.log('******************* MOUNTED');
        const onAnnotationLoadSuccess = (imagesData: ImageData[], labelNames: LabelName[]) => {
            props.updateImageDataAction(imagesData);
            props.updateLabelNamesAction(labelNames);
            props.updateActiveLabelTypeAction(labelType);
        
            console.log('import success');

            setImportReady(true);
        }
    
        const onAnnotationsLoadFailure = (error?:Error) => {    
            console.log(error)
        };
    
        async function init() {
            var response = await axios.get(props.imageUri, {responseType: 'blob'})
            var data = response.data;
            imageFile = new File([data], 'image.png');
            console.log(imageFile.size)

            var labelsFile = new File(props.labelsData, 'labels.txt');
            var annotationFile = new File(props.annotationData, 'image.txt');
                    
            props.updateProjectDataAction({
                ...props.projectData,
                type: ProjectType.OBJECT_DETECTION
            });    
            props.updateActiveImageIndexAction(0);
            props.addImageDataAction([ImageDataUtil.createImageDataFromFileData(imageFile)]);

            setImageReady(true);

            const importer = new (ImporterSpecData[formatType])([labelType])
            importer.import([labelsFile, annotationFile], onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
        };

        init();

        return () => { console.log('******************* UNMOUNTED');isMounted = false }
    }, []);

    return (
        <div className={classNames('App', {'AI': props.ObjectDetectorLoaded || props.PoseDetectionLoaded})}
            draggable={false}
        >
        {imageReady && <EditorView/>}
        <PopupView/>
        </div>
    );
};

const mapDispatchToProps = {
    updateActiveImageIndexAction: updateActiveImageIndex,
    addImageDataAction: addImageData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType,
    updateImageDataAction: updateImageData,
    updateLabelNamesAction: updateLabelNames,
    updateActiveLabelTypeAction: updateActiveLabelType
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    windowSize: state.general.windowSize,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded,
    projectData: state.general.projectData,
    activeLabelType: state.labels.activeLabelType
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageAnnotate);