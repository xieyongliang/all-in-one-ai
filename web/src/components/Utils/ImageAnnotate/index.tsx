import React, { useEffect, useState } from 'react';
import EditorView from '../../../views/EditorView/EditorView';
import {ProjectType} from '../../../data/enums/ProjectType';
import {AppState} from '../../../store';
import {connect} from 'react-redux';
import PopupView from '../../../views/PopupView/PopupView';
import {ISize} from '../../../interfaces/ISize';
import { ProjectData } from '../../../store/general/types';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { addImageLabelData, updateActiveLabelImageIndex, updateActiveLabelType, updateImageLabelData, updateLabelNames, updateActiveLabelNameId, updateFirstLabelCreatedFlag } from '../../../store/labels/actionCreators';
import { updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { updateActivePopupType, updateProjectData } from '../../../store/general/actionCreators';
import {ImageLabelData, LabelName} from '../../../store/labels/types';
import { ImageLabelDataUtil } from '../../../utils/ImageLabelDataUtil';
import {ImageTextData} from '../../../store/texts/types';
import { ImageTextDataUtil } from '../../../utils/ImageTextDataUtil';
import axios from 'axios';
import { LabelType } from '../../../data/enums/LabelType';
import { LoadingIndicator, Modal } from 'aws-northstar';
import { addImageTextData, updateActiveTextImageIndex } from '../../../store/texts/actionCreators';

interface IProps {
    updateActiveLabelImageIndexAction: (activeImageIndex: number) => any;
    updateActiveTextImageIndexAction: (activeImageIndex: number) => any;
    addImageLabelDataAction: (imageData: ImageLabelData[]) => any;
    addImageTextDataAction: (imageData: ImageTextData[]) => any;
    updateProjectDataAction: (projectData: ProjectData) => any;
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateImageLabelDataAction: (imageLabelData: ImageLabelData[]) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updateActiveLabelTypeAction: (activeLabelType: LabelType) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
    updateActiveLabelImageIndex: (activeImageIndex: number) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelNames: (labelNames: LabelName[]) => any;
    updateImageLabelData: (imageLabelData: ImageLabelData[]) => any;
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
    type: ProjectType;
    visible?: boolean;
    onClose?: () => any;
}

const ImageAnnotate: React.FC<IProps> = (
    {
        imageUri,
        projectData,
        type,
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
        updateActiveLabelImageIndex,
        updateImageLabelData,
        updateFirstLabelCreatedFlag,
        updatePerClassColorationStatusAction,
        updateProjectDataAction,
        updateActiveLabelImageIndexAction,
        updateActiveTextImageIndexAction,
        addImageLabelDataAction,
        addImageTextDataAction,
    }) => {
    const [imageReady, setImageReady] = useState(false)

    if(imageUri.startsWith('/'))
        imageUri = `${window.location.protocol}//${window.location.host}${imageUri}`    

    useEffect(() => {
        var imageFile : File;
        updateActiveLabelNameId(null);
        updateLabelNames([]);
        updateProjectData({type: null, name: 'my-project-name'});
        updateActiveLabelImageIndex(null);
        updateImageLabelData([]);
        updateFirstLabelCreatedFlag(false);
        updatePerClassColorationStatusAction(true)

        axios.get('/file/download', {params : {'uri' : encodeURIComponent(imageUri)} , responseType: 'blob'})
            .then((response) => {
                var data = response.data;
                imageFile = new File([data], 'image.png');
                            
                updateProjectDataAction({
                    ...projectData,
                    type: type
                });

                if(type === ProjectType.TEXT_RECOGNITION) {
                    updateActiveTextImageIndexAction(0);
                    addImageTextDataAction([ImageTextDataUtil.createImageTextDataFromFileData(imageFile)]);
                }
                else {
                    updateActiveLabelImageIndexAction(0);
                    addImageLabelDataAction([ImageLabelDataUtil.createImageLabelDataFromFileData(imageFile)]);
                }
    
                setImageReady(true);    
            })
      }, [imageUri]); // eslint-disable-line react-hooks/exhaustive-deps
    
      return (
            <Modal title="Image preview" visible={visible} onClose={()=>{setImageReady(false); onClose()}} width={"100"}>
                {
                    !imageReady && 
                    <LoadingIndicator 
                        label='Loading...'
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
    updateActiveLabelImageIndexAction: updateActiveLabelImageIndex,
    updateActiveTextImageIndexAction: updateActiveTextImageIndex,
    addImageLabelDataAction: addImageLabelData,
    addImageTextDataAction: addImageTextData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType,
    updateImageLabelDataAction: updateImageLabelData,
    updateLabelNamesAction: updateLabelNames,
    updateActiveLabelTypeAction: updateActiveLabelType,
    updatePerClassColorationStatusAction: updatePerClassColorationStatus,
    updateActiveLabelNameId,
    updateLabelNames,
    updateProjectData,
    updateActiveLabelImageIndex,
    updateImageLabelData,
    updateFirstLabelCreatedFlag,
    updateLabels: updateLabelNames
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