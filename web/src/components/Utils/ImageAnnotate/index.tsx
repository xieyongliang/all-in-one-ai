import React, { useEffect, useState } from 'react';
import EditorView from '../../../views/EditorView/EditorView';
import {ProjectType} from '../../../data/enums/ProjectType';
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import PopupView from '../../../views/PopupView/PopupView';
import {ISize} from '../../../interfaces/ISize';
import { ProjectData } from '../../../store/general/types';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { addImageData, updateActiveImageIndex, updateActiveLabelType, updateImageData, updateLabelNames, updateActiveLabelNameId, updateFirstLabelCreatedFlag } from '../../../store/labels/actionCreators';
import { updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { updateActivePopupType, updateProjectData } from '../../../store/general/actionCreators';
import {ImageData, LabelName} from '../../../store/labels/types';
import { ImageDataUtil } from '../../../utils/ImageDataUtil';
import axios from 'axios';
import { LabelType } from '../../../data/enums/LabelType';
import { LoadingIndicator, Modal } from 'aws-northstar';

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
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageAnnotations?: string[];
    imageColors: string[];
    imageLabels: string[];
    visible?: boolean;
    onClose?: () => any;
}

const ImageAnnotate: React.FC<IProps> = (
    {
        imageUri,
        projectData,
        visible,
        imageColors,
        imageLabels,
        imageAnnotations,
        imageBucket,
        imageId,
        imageKey,
        onClose,
        updateActiveLabelNameId,
        updateLabelNames,
        updateProjectData,
        updateActiveImageIndex,
        updateImageData,
        updateFirstLabelCreatedFlag,
        updatePerClassColorationStatusAction,
        updateProjectDataAction,
        updateActiveImageIndexAction,
        addImageDataAction
    }) => {
    const [imageReady, setImageReady] = useState(false)

    if(imageUri.startsWith('/'))
        imageUri = `${window.location.protocol}//${window.location.host}${imageUri}`    

    useEffect(() => {
        var imageFile : File;
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: 'my-project-name'});
        updateActiveImageIndex(null);
        updateImageData([]);
        updateFirstLabelCreatedFlag(false);
        updatePerClassColorationStatusAction(true)

        axios.get('/file/download', {params : {'uri' : encodeURIComponent(imageUri)} , responseType: 'blob'})
            .then((response) => {
                var data = response.data;
                imageFile = new File([data], 'image.png');
                            
                updateProjectDataAction({
                    ...projectData,
                    type: ProjectType.OBJECT_DETECTION_RECT
                });
                updateActiveImageIndexAction(0);
                addImageDataAction([ImageDataUtil.createImageDataFromFileData(imageFile)]);
    
                setImageReady(true);    
            })
      }, [imageUri]); // eslint-disable-line react-hooks/exhaustive-deps
    
      return (
        <Modal title="Image preview" visible={visible} onClose={()=>{setImageReady(false); onClose()}} width={"100"}>
            {
                !imageReady && 
                <LoadingIndicator 
                    label='Loading image...'
                />
            }
            { 
                imageReady && 
                <EditorView 
                    imageColors={imageColors} 
                    imageLabels={imageLabels} 
                    imageAnnotations={imageAnnotations}
                    imageBucket={imageBucket} 
                    imageKey={imageKey} 
                    imageId={imageId}
                /> 
            }
            { 
                imageReady && 
                <PopupView/>
            }
            </Modal>
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