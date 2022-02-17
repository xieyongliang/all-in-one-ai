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
import { updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { updateActivePopupType, updateProjectData } from '../../../store/general/actionCreators';
import {ImageData, LabelName} from '../../../store/labels/types';
import { ImageDataUtil } from '../../../utils/ImageDataUtil';
import axios from 'axios';
import { LabelType } from '../../../data/enums/LabelType';
import { AnnotationFormatType } from '../../../data/enums/AnnotationFormatType';
import { ImporterSpecData } from '../../../data/ImporterSpecData';
import { LabelsSelector } from '../../../store/selectors/LabelsSelector';

interface IProps {
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
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    projectData: ProjectData;
    activeLabelType: LabelType;
    imageUri: string;
    labelsData: string[];
    annotationData: string[];
    colorData: string[];
}

const ImageAnnotate: React.FC<IProps> = (props: PropsWithChildren<IProps>) => {
    const [importReady, setImportReady] = useState(false)
    const [imageReady, setImageReady] = useState(false)
    const formatType = AnnotationFormatType.YOLO
    const labelType = LabelType.RECT
    var labelNames = LabelsSelector.getLabelNames()

    useEffect(() => {
        var imageFile : File;
        var isMounted = true;

        console.log('******************* MOUNTED');
        const onAnnotationLoadSuccess = (imagesData: ImageData[], labelNames: LabelName[]) => {
            props.updateImageDataAction(imagesData);
            props.updateLabelNamesAction(labelNames);
            props.updateActiveLabelTypeAction(labelType);
        
            console.log('import success');

            var index = 0;
            props.annotationData.forEach(annotation => {
                var number = annotation.split(' ');
                var id = parseInt(number[0]);
                console.log(id);
                labelNames[id % props.colorData.length].color = props.colorData[id % props.colorData.length];
                labelNames[id].name = props.labelsData[id];
                index++;
            });

            props.updateLabels(labelNames);
            
            setImportReady(true);
        }
    
        const onAnnotationsLoadFailure = (error?:Error) => {    
            console.log(error)
        };
    
        async function init() {
            props.updateActiveLabelNameId(null);
            props.updateLabelNames([]);
            props.updateProjectData({type: null, name: "my-project-name"});
            props.updateActiveImageIndex(null);
            props.updateImageData([]);
            props.updateFirstLabelCreatedFlag(false);

            props.updatePerClassColorationStatusAction(true)

            var response = await axios.get('/file/download', {params : {'uri' : encodeURIComponent(props.imageUri)} , responseType: 'blob'})

            //var response = await axios.get(props.imageUri, {responseType: 'blob'})
            var data = response.data;
            imageFile = new File([data], 'image.png');
            console.log('--------------')
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
    projectType: state.general.projectData.type,
    windowSize: state.general.windowSize,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded,
    projectData: state.general.projectData,
    activeLabelType: state.labels.activeLabelType,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImageAnnotate);