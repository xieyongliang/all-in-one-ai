import React, { useCallback, useEffect, useState } from 'react';
import {ISize} from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import {ImageLabelData, LabelName, LabelRect} from "../../../../store/labels/types";
import './RectLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateActiveLabelType,
    updateImageLabelData,
    updateImageLabelDataById,
    updateLabelNames
} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import LabelInputField from "../LabelInputField/LabelInputField";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import {findLast} from "lodash";
import { Typography } from '@mui/material';
import axios from 'axios';
import { AnnotationFormatType } from '../../../../data/enums/AnnotationFormatType';
import { LabelType } from '../../../../data/enums/LabelType';
import { ImporterSpecData } from '../../../../data/ImporterSpecData';
import { useParams } from 'react-router-dom';
import { PathParams } from '../../../../components/Interfaces/PathParams';
import { store } from '../../../..';
import { Stack, Select, Button } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import { LabelsSelector } from '../../../../store/selectors/LabelsSelector';

interface IProps {
    size: ISize;
    imageData: ImageLabelData;
    activeLabelId: string;
    highlightedLabelId: string;
    labelNames: LabelName[];
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageLabels: string[];
    imageColors: string[];
    imageAnnotations?: string[];
    imageName: string;
    updateActiveLabelId: (activeLabelId: string) => any;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    updateImageLabelDataById: (id: string, newImageLabelData: ImageLabelData) => any;
    updateImageLabelData: (imagesData) => any;
    updateLabelNames: (labelNames) => any;
    updateActiveLabelType : (LabelType) => any;
    onProcessing: () => any;
    onProcessed: () => any;    
}

const RectLabelsList: React.FC<IProps> = (
{
    size, 
    imageData, 
    labelNames, 
    activeLabelId, 
    highlightedLabelId, 
    imageBucket,
    imageKey,
    imageId,
    imageLabels,
    imageColors,
    imageAnnotations,
    imageName,
    updateImageLabelDataById,
    updateActiveLabelNameId, 
    updateActiveLabelId,
    onProcessing,
    onProcessed
}) => {
    const [ yolov5Endpoints, setYolov5Endpoints ] = useState([])
    const [ selectedYolov5Endpoint, setSelectedYolov5Endpoint ] = useState<SelectOption>()
    const [ computedAnnotations ] = useState<string[]>(imageAnnotations !== undefined ? imageAnnotations :[])
    
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
                var items = []
                response.data.forEach((item) => {
                    items.push({label: item.EndpointName, value: item.EndpointName})
                    if(items.length === response.data.length) {
                        setYolov5Endpoints(items)
                        setSelectedYolov5Endpoint(items[0])
                    }
                })
            }
        )
    }, [params.id]);

    const deleteRectLabelById = (labelRectId: string) => {
        LabelActions.deleteRectLabelById(imageData.id, labelRectId);
    };

    const updateRectLabel = (labelRectId: string, labelNameId: string) => {
        const newImageLabelData = {
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
        updateImageLabelDataById(imageData.id, newImageLabelData);
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

    const onChange = (id, event) => {
        setSelectedYolov5Endpoint({label: event.target.value, value: event.target.value})
    }

    const getInference = async () => {
        onProcessing()

        var response = undefined
        if(imageBucket !== undefined && imageKey!== undefined)
            response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedYolov5Endpoint.value, bucket: imageBucket, key: imageKey } })
        else if(imageId !== undefined)
            response = await axios.get(`/_inference/image/${imageId}`, { params : { endpoint_name: selectedYolov5Endpoint.value, bucket: imageBucket, key: imageKey } })

        if(response === undefined)
            return response
        else
            return response.data
    }

    const onAnnotationLoadSuccess = useCallback((imagesData: ImageLabelData[], labelNames: LabelName[]) => {
        store.dispatch(updateImageLabelData(imagesData));
        store.dispatch(updateLabelNames(labelNames));
        store.dispatch(updateActiveLabelType(LabelType.RECT));
    
        computedAnnotations.forEach(annotation => {
            var number = annotation.split(' ');
            var id = parseInt(number[0]);
            labelNames[id % imageColors.length].color = imageColors[id % imageColors.length];
            labelNames[id].name = imageLabels[id];
        });

        store.dispatch(updateLabelNames(labelNames));
    }, [ computedAnnotations, imageColors, imageLabels]);

    const onAnnotationsLoadFailure = (error?:Error) => {    
        console.log(error)
    };

    const importAnnotations = useCallback(() => {
        var labelsFile = new File(imageLabels, 'labels.txt');
        var annotationFile = new File(computedAnnotations, `${imageName}.txt`);
        
        const formatType = AnnotationFormatType.YOLO
        const labelType = LabelType.RECT
                
        const importer = new (ImporterSpecData[formatType])([labelType])
        importer.import([labelsFile, annotationFile], onAnnotationLoadSuccess, onAnnotationsLoadFailure);         
    }, [ computedAnnotations, imageLabels, onAnnotationLoadSuccess ]);

    const onInference = () => {
        getInference().then(data => {

            var imageData = LabelsSelector.getActiveImageLabelData();
            imageData.labelRects.splice(0, imageData.labelRects.length);
            store.dispatch(updateImageLabelData([imageData]));
    
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
            onProcessed();
        }, (error) => {
            console.log(error);
        });
    }

    return (
        <div
            className="RectLabelsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            <Scrollbars>
                <Stack>
                    <div className='Command'>
                         <Typography variant="button" gutterBottom component="div">
                            object detection
                        </Typography>                       
                        <Select
                            options = {yolov5Endpoints}
                            selectedOption = {selectedYolov5Endpoint}
                            onChange = {(event) => onChange('YolovtEndpoints', event)}
                        />
                        <Button variant="primary" size="small" onClick={onInference}>Select and inference</Button>
                    </div>
                </Stack>
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
    updateImageLabelDataById,
    updateActiveLabelNameId,
    updateActiveLabelId,
    updateImageLabelData,
    updateLabelNames,
    updateActiveLabelType
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectLabelsList);