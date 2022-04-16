import React, { useEffect, useState } from 'react';
import EditorView from '../../../views/EditorView/EditorView';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { AppState } from '../../../store';
import { connect} from 'react-redux';
import PopupView from '../../../views/PopupView/PopupView';
import { ISize } from '../../../interfaces/ISize';
import { ProjectData } from '../../../store/general/types';
import { addLabelImageData, updateActiveLabelImageIndex, updateActiveLabelType, updateLabelImageData, updateLabelNames, updateActiveLabelNameId, updateFirstLabelCreatedFlag } from '../../../store/labels/actionCreators';
import { updatePerClassColorationStatus } from '../../../store/general/actionCreators';
import { updateActivePopupType, updateProjectData } from '../../../store/general/actionCreators';
import { LabelImageData, LabelName} from '../../../store/labels/types';
import { LabelImageDataUtil } from '../../../utils/LabelImageDataUtil';
import { TextImageData, Text } from '../../../store/texts/types';
import { TextImageDataUtil } from '../../../utils/TextImageDataUtil';
import axios from 'axios';
import { LabelType } from '../../../data/enums/LabelType';
import { LoadingIndicator, Modal } from 'aws-northstar';
import { addTextImageData, updateActiveTextId, updateActiveTextImageIndex, updateTextImageData, updateTexts } from '../../../store/texts/actionCreators';
import { Box, Dialog } from '@material-ui/core';
import { LabelUtil } from '../../../utils/LabelUtil';

interface IProps {
    updateActiveLabelNameIdAction: (activeLabelNameId: string) => any;
    updateActiveTextIdAction: (activeTextId: string) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updateTextsAction: (texts: Text[]) => any;
    updateProjectDataAction: (projectData: ProjectData) => any;
    updateActiveLabelImageIndexAction: (activeImageIndex: number) => any;
    updateActiveTextImageIndexAction: (activeImageIndex: number) => any;
    addLabelImageDataAction: (imageData: LabelImageData[]) => any;
    addTextImageDataAction: (imageData: TextImageData[]) => any;
    updateLabelImageDataAction: (imageData: LabelImageData[]) => any;
    updateTextImageDataAction: (imageData: TextImageData[]) => any;
    updateActiveLabelTypeAction: (activeLabelType: LabelType) => any;
    updateFirstLabelCreatedFlagAction: (firstLabelCreatedFlag: boolean) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
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
    imageName: string;
    type: ProjectType;
    subType: ProjectSubType;
    visible?: boolean;
    onClose?: () => any;
}

const ImageAnnotate: React.FC<IProps> = (
    {
        imageUri,
        projectData,
        type,
        subType,
        visible,
        imageColors,
        imageLabels,
        imageAnnotations,
        imageBucket,
        imageId,
        imageKey,
        imageName,
        updateActiveLabelNameIdAction,
        updateActiveTextIdAction,
        updateLabelNamesAction,
        updateTextsAction,
        updateProjectDataAction,
        updateActiveLabelImageIndexAction,
        updateActiveTextImageIndexAction,
        updateLabelImageDataAction,
        updateTextImageDataAction,
        updateFirstLabelCreatedFlagAction, 
        updatePerClassColorationStatusAction,
        addLabelImageDataAction,
        addTextImageDataAction,
        onClose,
    }) => {
    const [ loading, setLoading ] = useState(true)
    const [ ready, setReady ] = useState(false)

    if(imageUri.startsWith('/'))
        imageUri = `${window.location.protocol}//${window.location.host}${imageUri}`    

    useEffect(() => {
        var imageFile : File;
        updateActiveLabelNameIdAction(null);
        updateActiveTextIdAction(null);
        updateLabelNamesAction([]);
        updateTextsAction([]);
        updateProjectDataAction({type: null, subType: null, name: 'my-project-name'});
        updateActiveLabelImageIndexAction(null);
        updateActiveTextImageIndexAction(null);
        updateLabelImageDataAction([]);
        updateTextImageDataAction([]);
        updateFirstLabelCreatedFlagAction(false);
        updatePerClassColorationStatusAction(true)

        axios.get('/_file/download', {params : {'uri' : encodeURIComponent(imageUri)} , responseType: 'blob'})
            .then((response) => {
                var data = response.data;
                imageFile = new File([data], `${imageName}.png`);
                
                updateProjectDataAction({
                    ...projectData,
                    type: type,
                    subType: subType,
                    name: imageName
                });

                if(type === ProjectType.TEXT_RECOGNITION) {
                    updateActiveTextImageIndexAction(0);
                    addTextImageDataAction([TextImageDataUtil.createTextImageDataFromFileData(imageFile)]);
                }
                else {
                    updateActiveLabelImageIndexAction(0);
                    var labelNames = []
                    imageLabels.forEach((imageLabel)=>{
                        labelNames.push(LabelUtil.createLabelName(imageLabel))
                    })
                    updateLabelNamesAction(labelNames);
                    addLabelImageDataAction([LabelImageDataUtil.createLabelImageDataFromFileData(imageFile)]);
                }
                setReady(true);
            })
    }, [imageUri]); // eslint-disable-line react-hooks/exhaustive-deps
    
    const onLoaded = () => {
        setLoading(false)
    }

    if(!ready)
        return (
            <Dialog open={true}>
                <Box p={3}>
                    <LoadingIndicator label='Loading...'/>
                </Box>
            </Dialog>
        )
    else
        return (
            <Modal title="Image preview" visible={visible} onClose={()=>onClose()} width={"100"}>
                {
                    loading &&  
                    <Dialog open={true}>
                        <Box p={3}>
                            <LoadingIndicator label='Preparing...'/>
                        </Box>
                    </Dialog>   
                }
                {
                    ready && 
                    <EditorView 
                        imageColors = {imageColors} 
                        imageLabels = {imageLabels} 
                        imageAnnotations = {imageAnnotations}
                        imageBucket = {imageBucket} 
                        imageKey = {imageKey} 
                        imageId = {imageId}
                        imageName = {imageName}
                        onLoaded = {onLoaded}
                    /> 
                }
                {
                    ready &&
                    <PopupView/>
                }
            </Modal>
        );
};

const mapDispatchToProps = {
    updateActiveLabelNameIdAction: updateActiveLabelNameId,
    updateActiveTextIdAction: updateActiveTextId,
    updateLabelNamesAction: updateLabelNames,
    updateTextsAction: updateTexts,
    updateActiveLabelImageIndexAction: updateActiveLabelImageIndex,
    updateActiveTextImageIndexAction: updateActiveTextImageIndex,
    addLabelImageDataAction: addLabelImageData,
    addTextImageDataAction: addTextImageData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType,
    updateLabelImageDataAction: updateLabelImageData,
    updateTextImageDataAction: updateTextImageData,
    updateActiveLabelTypeAction: updateActiveLabelType,
    updateFirstLabelCreatedFlagAction: updateFirstLabelCreatedFlag,
    updatePerClassColorationStatusAction: updatePerClassColorationStatus,
};

const mapStateToProps = (state: AppState) => ({
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