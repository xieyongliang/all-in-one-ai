import React, { useCallback, useEffect, useState } from 'react';
import { ISize } from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import { LabelImageData, LabelName, LabelRect } from "../../../../store/labels/types";
import './RectLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateActiveLabelType,
    updateLabelImageData,
    updateLabelImageDataById,
    updateLabelNames
} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import LabelInputField from "../LabelInputField/LabelInputField";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import { findLast } from "lodash";
import { Typography } from '@mui/material';
import axios from 'axios';
import { AnnotationFormatType } from '../../../../data/enums/AnnotationFormatType';
import { LabelType } from '../../../../data/enums/LabelType';
import { ImporterSpecData } from '../../../../data/ImporterSpecData';
import { useParams } from 'react-router-dom';
import { PathParams } from '../../../../components/Interfaces/PathParams';
import { store } from '../../../..';
import { Stack, Button } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import { LabelsSelector } from '../../../../store/selectors/LabelsSelector';
import { ProjectSubType } from '../../../../data/enums/ProjectType';
import Select from '../../../../components/Utils/Select';
import { useTranslation } from "react-i18next";

interface IProps {
    size: ISize;
    imageData: LabelImageData;
    activeLabelId: string;
    activeImageIndex: number;
    highlightedLabelId: string;
    labelNames: LabelName[];
    projectSubType: ProjectSubType;
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    imageLabels: string[];
    imageColors: string[];
    imageAnnotations?: string[];
    imageNames: string[];
    updateActiveLabelId: (activeLabelId: string) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateLabelImageDataById: (id: string, newImageData: LabelImageData) => any;
    updateLabelImageData: (imagesData) => any;
    updateLabelNames: (labelNames) => any;
    updateActiveLabelType : (LabelType) => any;
    onLoaded: () => any;
    onProcessing: () => any;
    onProcessed: () => any;
}

const RectLabelsList: React.FC<IProps> = (
{
    size, 
    imageData, 
    labelNames, 
    projectSubType,
    activeLabelId, 
    activeImageIndex,
    highlightedLabelId, 
    imageBuckets,
    imageKeys,
    imageId,
    imageLabels,
    imageColors,
    imageAnnotations,
    imageNames,
    updateLabelImageDataById,
    updateActiveLabelNameId, 
    updateActiveLabelId,
    onLoaded,
    onProcessing,
    onProcessed
}) => {
    const [ yolov5Endpoints, setYolov5Endpoints ] = useState([]);
    const [ selectedYolov5Endpoint, setSelectedYolov5Endpoint ] = useState<SelectOption>();
    const [ computedAnnotations ] = useState<string[]>(imageAnnotations !== undefined ? imageAnnotations :[]);
    
    const { t } = useTranslation();

    const labelInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.labelRects.length * labelInputFieldHeight
    };

    var params : PathParams = useParams();
        
    useEffect(() => {
        axios.get('/endpoint', {params: { industrial_model: params.id}})
            .then((response) => {
                if(response.data.length > 0) {
                    var items = [];
                    response.data.forEach((item) => {
                        items.push({label: item.EndpointName, value: item.EndpointName})
                        if(items.length === response.data.length) {
                            setYolov5Endpoints(items);
                            setSelectedYolov5Endpoint(items[0]);
                            onLoaded()
                        }
                    })
                }
                else
                    onLoaded()
            }
        )
    }, [params.id, onLoaded]);

    const deleteRectLabelById = (labelRectId: string) => {
        LabelActions.deleteRectLabelById(imageData.id, labelRectId);
    };

    const updateRectLabel = (labelRectId: string, labelNameId: string) => {
        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects
                .map((labelRect: LabelRect) => {
                if (labelRect.id === labelRectId) {
                    return {
                        ...labelRect,
                        labelId: labelNameId,
                        status: LabelStatus.ACCEPTED
                    }
                } else {
                    return labelRect
                }
            })
        };
        updateLabelImageDataById(imageData.id, newImageData);
        updateActiveLabelNameId(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelId(null);
    };

    const getChildren = () => {
        return imageData.labelRects
            .filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
            .map((labelRect: LabelRect) => {
            return <LabelInputField
                size={{
                    width: size.width,
                    height: labelInputFieldHeight
                }}
                isActive={labelRect.id === activeLabelId}
                isHighlighted={labelRect.id === highlightedLabelId}
                id={labelRect.id}
                key={labelRect.id}
                onDelete={deleteRectLabelById}
                value={labelRect.labelId !== null ? findLast(labelNames, {id: labelRect.labelId}) : null}
                options={labelNames}
                onSelectLabel={updateRectLabel}
            />
        });
    };

    const getInference = async () => {
        onProcessing()

        var response = undefined
        if(imageBuckets !== undefined && imageKeys !== undefined && imageBuckets[activeImageIndex] !== undefined && imageKeys[activeImageIndex]!== undefined)
            response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedYolov5Endpoint.value, bucket: imageBuckets[activeImageIndex], key: imageKeys[activeImageIndex] } })
        else if(imageId !== undefined)
            response = await axios.get(`/_inference/image/${imageId}`, { params : { endpoint_name: selectedYolov5Endpoint.value } })

        if(response === undefined)
            return response
        else
            return response.data
    }

    const onAnnotationLoadSuccess = useCallback((imagesData: LabelImageData[], labelNames: LabelName[]) => {
        store.dispatch(updateLabelImageData(imagesData));
        store.dispatch(updateLabelNames(labelNames));
        store.dispatch(updateActiveLabelType(LabelType.RECT));
    
        computedAnnotations.forEach(annotation => {
            var number = annotation.split(' ');
            var id = parseInt(number[0]);
            labelNames[id % imageColors.length].color = imageColors[id % imageColors.length];
            labelNames[id].name = imageLabels[id];
        });

        store.dispatch(updateLabelNames(labelNames));
        onProcessed();
    }, [ computedAnnotations, imageColors, imageLabels, onProcessed]);

    const onAnnotationsLoadFailure = useCallback((error?:Error) => {   
        onProcessed(); 
        console.log(error)
    }, [onProcessed]);

    const importAnnotations = useCallback(() => {
        var labelsFile = new File(imageLabels, 'labels.txt');
        var imageName = imageNames[activeImageIndex];
        var annotationFile = new File(computedAnnotations, `${imageName}.txt`);
        
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        importer.import([labelsFile, annotationFile], onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
    }, [ computedAnnotations, imageLabels, imageNames, activeImageIndex, onAnnotationLoadSuccess, onAnnotationsLoadFailure ]);

    const onInference = () => {
        getInference().then(data => {
            var imageData = LabelsSelector.getActiveImageData();
            imageData.labelRects.splice(0, imageData.labelRects.length);
            store.dispatch(updateLabelImageData([imageData]));
    
            var imageBboxs : number[][] = [];
            var imageIds : number[] = [];
            for(let item of data) {
                var numbers = item.split(' ');
                imageIds.push(parseInt(numbers[0]));
                var box : number[] = [];
                box.push(parseFloat(numbers[1]));
                box.push(parseFloat(numbers[2]));
                box.push(parseFloat(numbers[3]));
                box.push(parseFloat(numbers[4]));
                imageBboxs.push(box);
            }
            var index = 0;
            computedAnnotations.splice(0, computedAnnotations.length)
            imageBboxs.forEach(item => {
                var annotation : string = imageIds[index] + ' ' + item[0] + ' ' + item[1] + ' ' + item[2] + ' ' + item[3] + '\r';
                computedAnnotations.push(annotation);
                index++;
            });
                
            importAnnotations();
        }, (error) => {
            console.log(error);
            onProcessed();
        });
    }

    const onChange = (option: SelectOption) => {
        setSelectedYolov5Endpoint(option)
    }

    return (
        <div
            className="RectLabelsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            <Scrollbars>
                {
                    projectSubType === ProjectSubType.OBJECT_DETECTION && 
                    <Stack>
                        <div className='Command'>
                            <div>
                                <Typography gutterBottom component="div">
                                    {t('industrial_models.demo.select_endpoint_object_detection')}
                                </Typography>    
                            </div>
                            <Select 
                                options = {yolov5Endpoints}
                                onChange = {onChange}
                            />
                            <Button variant='primary' size="small" onClick={onInference}>{t('industrial_models.demo.run')}</Button>
                        </div>
                    </Stack>
                }
                <div
                    className="RectLabelsListContent"
                    style={listStyleContent}
                >
                    {getChildren()}
                </div>
            </Scrollbars>
        </div>
    );
};

const mapDispatchToProps = {
    updateLabelImageDataById,
    updateActiveLabelNameId,
    updateActiveLabelId,
    updateLabelImageData,
    updateLabelNames,
    updateActiveLabelType
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    activeImageIndex: state.labels.activeImageIndex,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels,
    projectSubType: state.general.projectData.subType,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectLabelsList);