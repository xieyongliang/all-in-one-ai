import React, { useEffect, useState } from 'react';
import EditorView from '../../../views/EditorView/EditorView';
import { ProjectSubType, ProjectType } from '../../../data/enums/ProjectType';
import { AppState } from '../../../store';
import { connect} from 'react-redux';
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
import { LoadingIndicator } from 'aws-northstar';
import { addTextImageData, updateActiveTextId, updateActiveTextImageIndex, updateTextImageData, updateTexts } from '../../../store/texts/actionCreators';
import { Box, Dialog } from '@material-ui/core';
import { LabelUtil } from '../../../utils/LabelUtil';
import { store } from '../../..';
import { AnnotationFormatType } from '../../../data/enums/AnnotationFormatType';
import { ImporterSpecData } from '../../../data/ImporterSpecData';
import { useTranslation } from "react-i18next";
import { logOutput } from '../Helper';
import { RankImageData } from '../../../store/ranks/types';
import { addRankImageData, updateActiveRankImageIndex, updateRankImageData } from '../../../store/ranks/actionCreators';
import { RankImageDataUtil } from '../../../utils/RankImageDataUtil';

const OVERLAY_STYLE = {
    position: "fixed" as 'fixed',
    display: "block",
    justifyContent: "center",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    paddingLeft: "6px",
    backgroundColor: "white",
    zIndex: "4000",
    overflow: "auto"
};

interface IProps {
    updateActiveLabelNameIdAction: (activeLabelNameId: string) => any;
    updateActiveTextIdAction: (activeTextId: string) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    updateTextsAction: (texts: Text[]) => any;
    updateProjectDataAction: (projectData: ProjectData) => any;
    updateActiveLabelImageIndexAction: (activeImageIndex: number) => any;
    updateActiveTextImageIndexAction: (activeImageIndex: number) => any;
    updateActiveRankImageIndexAction: (activeImageIndex: number) => any;
    addLabelImageDataAction: (imageData: LabelImageData[]) => any;
    addTextImageDataAction: (imageData: TextImageData[]) => any;
    addRankImageDataAction: (imageData: RankImageData[]) => any;
    updateLabelImageDataAction: (imageData: LabelImageData[]) => any;
    updateTextImageDataAction: (imageData: TextImageData[]) => any;
    updateRankImageDataAction: (imageData: RankImageData[]) => any;
    updateActiveLabelTypeAction: (activeLabelType: LabelType) => any;
    updateFirstLabelCreatedFlagAction: (firstLabelCreatedFlag: boolean) => any;
    updatePerClassColorationStatusAction: (updatePerClassColoration: boolean) => any;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
    projectData: ProjectData;
    activeLabelType: LabelType;
    imageUris: string[];
    imageNames: string[];
    activeIndex: number;
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    imageAnnotations?: string[];
    imageColors: string[];
    imageLabels: string[];
    projectName: string;
    type: ProjectType;
    subType: ProjectSubType;
    onClosed?: () => any;
}

const ImageAnnotate: React.FC<IProps> = (
    {
        imageUris,
        imageNames,
        activeIndex,
        projectData,
        projectName,
        type,
        subType,
        imageColors,
        imageLabels,
        imageAnnotations,
        imageBuckets,
        imageId,
        imageKeys,
        updateActiveLabelNameIdAction,
        updateActiveTextIdAction,
        updateLabelNamesAction,
        updateTextsAction,
        updateProjectDataAction,
        updateActiveLabelImageIndexAction,
        updateActiveTextImageIndexAction,
        updateActiveRankImageIndexAction,
        updateLabelImageDataAction,
        updateTextImageDataAction,
        updateRankImageDataAction,
        updateFirstLabelCreatedFlagAction, 
        updatePerClassColorationStatusAction,
        addLabelImageDataAction,
        addTextImageDataAction,
        addRankImageDataAction,
        onClosed,
    }) => {
    const [ loading, setLoading ] = useState(true)
    const [ ready, setReady ] = useState(false)

    const { t } = useTranslation();

    for(var index = 0; index < imageUris.length; index ++) {
        var imageUri = imageUris[index]
        if(imageUri.startsWith('/')) {
            imageUri = `${window.location.protocol}//${window.location.host}${imageUri}`;
            imageUris[index] = imageUri;
        }
    }

    const onAnnotationLoadSuccess = (imagesData: LabelImageData[], labelNames: LabelName[]) => {
        store.dispatch(updateLabelImageData(imagesData));
        store.dispatch(updateLabelNames(labelNames));
        store.dispatch(updateActiveLabelType(LabelType.RECT));

        store.dispatch(updateLabelNames(labelNames));
        onLoaded();
    }

    const onAnnotationsLoadFailure = (error?:Error) => {    
        logOutput('error', error, undefined, error);
        onLoaded();
    };

    const importAnnotations = (labelsFile: File, annotationFiles: File[] ) => {
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        var files : File[] = [];
        files.push(labelsFile)
        annotationFiles.forEach((annotationFile) => {
            files.push(annotationFile)
        })
        importer.import(files, onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
    }      
    
    useEffect(() => {
        var imageFile : File;
        updateActiveLabelNameIdAction(null);
        updateActiveTextIdAction(null);
        updateLabelNamesAction([]);
        updateTextsAction([]);
        updateProjectDataAction({type: null, subType: null, name: ''});
        updateActiveLabelImageIndexAction(null);
        updateActiveTextImageIndexAction(null);
        updateActiveRankImageIndexAction(null);
        updateLabelImageDataAction([]);
        updateTextImageDataAction([]);
        updateRankImageDataAction([]);
        updateFirstLabelCreatedFlagAction(false);
        updatePerClassColorationStatusAction(true)

        var imageExts = imageUris.map((imageUri) => {
            var pos = imageUri.indexOf('?');
            var httpuri = imageUri.substring(0, pos)
            return httpuri.substring(httpuri.lastIndexOf('.') + 1)
        })

        var promises = imageUris.map((imageUri) => {
            return axios.get('/_file/download', {params : {'uri' : encodeURIComponent(imageUri)} , responseType: 'blob'})
        })

        var promises2 = []

        Promise.all(promises).then((reponses) => {
            var index = 0;
            reponses.forEach((response) => {
                var imageName = imageNames[index];
                var imageExt = imageExts[index];

                var data = response.data;

                imageFile = new File([data], `${imageName}.${imageExt}`);
                updateProjectDataAction({
                    ...projectData,
                    type: type,
                    subType: subType,
                    name: projectName
                });

                if(type === ProjectType.IMAGE_RANK) {
                    addRankImageDataAction([RankImageDataUtil.createRankImageDataFromFileData(imageFile)])
                }
                else if(type === ProjectType.TEXT_RECOGNITION) {
                    addTextImageDataAction([TextImageDataUtil.createTextImageDataFromFileData(imageFile)]);
                }
                else {
                    var labelNames = []
                    imageLabels.forEach((imageLabel)=>{
                        labelNames.push(LabelUtil.createLabelName(imageLabel))
                    })
                    updateLabelNamesAction(labelNames);
                    addLabelImageDataAction([LabelImageDataUtil.createLabelImageDataFromFileData(imageFile)]);
                }

                if(type === ProjectType.OBJECT_DETECTION_RECT && subType === ProjectSubType.BATCH_LABEL && imageBuckets !== undefined && imageKeys !== undefined) {
                    var bucket = imageBuckets[index]
                    var key = imageKeys[index]
                    promises2.push(axios.get('/annotation', {params: { bucket: bucket, key: key}}))
                }

                index++;
            })

            if(type === ProjectType.OBJECT_DETECTION_RECT && subType === ProjectSubType.BATCH_LABEL && imageBuckets !== undefined && imageKeys !== undefined) {
                Promise.all(promises2).then((reponses2) => {
                    index = 0;
                    var annotationFiles = [];
                    reponses2.forEach((response) => {
                        if(response.data.data !== undefined) {
                            var annotations = response.data.data.split('\n');
                            var computedAnnotations = [];
                            annotations.forEach(annotation => {
                                computedAnnotations.push(annotation + '\n')
                            });
                            var imageName = imageNames[index];
                            var annotationFile = new File(computedAnnotations, `${imageName}.txt`);
                            annotationFiles.push(annotationFile);
                        }
                        index++;
                    })
                    var labelsFile = new File(imageLabels, 'labels.txt');
                    importAnnotations(labelsFile, annotationFiles)
                })
            }

            if(type === ProjectType.IMAGE_RANK)
                updateActiveRankImageIndexAction(activeIndex)
            else if(type === ProjectType.TEXT_RECOGNITION)
                updateActiveTextImageIndexAction(activeIndex)
            else
                updateActiveLabelImageIndexAction(activeIndex);
            setReady(true);
        })

    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onLoaded = () => {
        setLoading(false)
    }

    const onCleanup = () => {
        updateProjectDataAction({type: null, subType: null, name: ''});
        onClosed();
    }

    var fileNames = [];
    var imageExts = imageUris.map((imageUri) => {
        var pos = imageUri.indexOf('?');
        var httpuri = imageUri.substring(0, pos)
        return httpuri.substring(httpuri.lastIndexOf('.') + 1)
    })

    for(var i = 0; i < imageNames.length; i++){
        var imageName = imageNames[i];
        var imageExt = imageExts[i];
        fileNames.push(`${imageName}.${imageExt}`)
    }

    if(!ready)
        return (
            <Dialog open={true}>
                <Box p={3}>
                    <LoadingIndicator label={t('industrial_models.demo.preparing')}/>
                </Box>
            </Dialog>
        )
    else
        return (
            <div style={OVERLAY_STYLE}>
                {
                    ready && 
                    <EditorView 
                        imageColors = {imageColors} 
                        imageAnnotations = {imageAnnotations}
                        imageBuckets = {imageBuckets} 
                        imageKeys = {imageKeys} 
                        imageId = {imageId}
                        imageNames = {(type === ProjectType.IMAGE_RANK) ? fileNames : imageNames}
                        imageLabels = {(type === ProjectType.IMAGE_RANK) ? [] : imageLabels}
                        onLoaded = {onLoaded}
                        onClosed = {onCleanup}
                    /> 
                }
                {
                    loading && 
                    <Dialog open={true} style={{zIndex: 4000}}>
                        <Box p={3}>
                            <LoadingIndicator label={t('industrial_models.demo.loading')}/>
                        </Box>
                    </Dialog>
                }
            </div>
        );
};

const mapDispatchToProps = {
    updateActiveLabelNameIdAction: updateActiveLabelNameId,
    updateActiveTextIdAction: updateActiveTextId,
    updateLabelNamesAction: updateLabelNames,
    updateTextsAction: updateTexts,
    updateActiveLabelImageIndexAction: updateActiveLabelImageIndex,
    updateActiveTextImageIndexAction: updateActiveTextImageIndex,
    updateActiveRankImageIndexAction: updateActiveRankImageIndex,
    addLabelImageDataAction: addLabelImageData,
    addTextImageDataAction: addTextImageData,
    addRankImageDataAction: addRankImageData,
    updateProjectDataAction: updateProjectData,
    updateActivePopupTypeAction: updateActivePopupType,
    updateLabelImageDataAction: updateLabelImageData,
    updateTextImageDataAction: updateTextImageData,
    updateRankImageDataAction: updateRankImageData,
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