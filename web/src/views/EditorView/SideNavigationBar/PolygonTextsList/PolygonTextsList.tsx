import React, { useCallback, useEffect, useState } from 'react';
import { ISize } from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import './PolygonTextsList.scss';
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import TextInputField from '../TextInputField/TextInputField';
import { TextImageData, TextPolygon } from "../../../../store/texts/types";
import {
    updateActiveTextId,
    updateTextImageDataById
} from "../../../../store/texts/actionCreators";
import { TextActions } from '../../../../logic/actions/TextActions';
import { Typography } from '@mui/material';
import { ProjectSubType } from '../../../../data/enums/ProjectType';
import axios from 'axios';
import { TextsSelector } from '../../../../store/selectors/TextsSelector';
import { TextUtil } from '../../../../utils/TextUtil';
import { store } from '../../../..';
import { Button, Select, Stack } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import { IPoint } from '../../../../interfaces/IPoint';

interface IProps {
    size: ISize;
    imageData: TextImageData;
    activeTextId: string;
    projectSubType: ProjectSubType;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    industrialModels: IIndustrialModel[];
    updateTextImageDataById: (id: string, newImageData: TextImageData) => any;
    onProcessing: () => any;
    onProcessed: () => any;
    onLoaded: () => any;
}

const PolygonTextsList: React.FC<IProps> = (
    {
        size, 
        imageData, 
        activeTextId, 
        projectSubType, 
        imageBucket,
        imageKey,
        imageId,
        industrialModels,
        updateTextImageDataById,
        onProcessing,
        onProcessed,
        onLoaded
    }) => {
    const [ yolov5EndpointOptions, setYolov5EndpointOptions ] = useState([])
    const [ selectedYolov5Endpoint, setSelectedYolov5Endpoint ] = useState<SelectOption>()    
    const [ paddleocrEndpointOptions, setPaddleOCREndpointOptions ] = useState([])
    const [ selectedPaddleOCREndpoint, setSelectedPaddleOCREndpoint ] = useState<SelectOption>()
    const [ textFieldOptions, setTextFieldOptions ] = useState([])
    const [ selectedTextField, setSelectedTextField ] = useState<SelectOption>()
    const [ yolov5EndpointsMapping, setYolov5EndpointsMapping ] = useState({})
    const [ loadingYolov5, setLoadingYolov5 ] = useState(true)
    const [ loadingPaddleOCR, setLoadingPaddleOCR ] = useState(true)
    var processingCount = 0;

    const textInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.textPolygons.length * textInputFieldHeight
    };

    const handleProcessing = () => {
        if(processingCount === 0) 
            onProcessing();
        processingCount++;
    }

    const handleProcessed = () => {
        processingCount--;
        if(processingCount === 0)
            onProcessed();
    }

    const handleLoaded = useCallback(() => {
        if(projectSubType === ProjectSubType.OBJECT_DETECTION) {
            if(!loadingPaddleOCR && !loadingYolov5)
                onLoaded();
        }
        else {
            if(!loadingPaddleOCR)
                onLoaded();
        }
    }, [loadingPaddleOCR, loadingYolov5, projectSubType, onLoaded])

    useEffect(() => {
        var count = industrialModels.filter((industrial_model) => industrial_model.algorithm === 'paddleocr').length;
        var index = 0;
        var paddleocrEndpointOptions = [];
        industrialModels.forEach((industrialModel) => {
            if(industrialModel.algorithm === 'paddleocr') {
                axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                    .then((response) => {
                        var endpointItems = []  
                        response.data.forEach((item) => {
                            endpointItems.push({label : item.EndpointName, value: item.EndpointName})
                            if(endpointItems.length === response.data.length) {
                                index++;
                                paddleocrEndpointOptions = paddleocrEndpointOptions.concat(endpointItems);
                                if(index === count) {
                                    setPaddleOCREndpointOptions(paddleocrEndpointOptions);
                                    setLoadingPaddleOCR(false);
                                    handleLoaded();
                                }
                            }
                        })
                    }
                )
            }
        })
    }, [industrialModels, handleLoaded]);

    useEffect(() => {
        if(projectSubType === ProjectSubType.OBJECT_DETECTION) {
            var count = industrialModels.filter((industrial_model) => industrial_model.algorithm === 'yolov5').length;
            var index = 0;
            var yolov5EndpointOptions = [];
            var yolov5EndpointsMapping = {};
            industrialModels.forEach((industrialModel) => {
                if(industrialModel.algorithm === 'yolov5') {
                    axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                        .then((response) => {
                            var endpointItems = []
                            response.data.forEach((item) => {
                                endpointItems.push({label : item.EndpointName, value: item.EndpointName})
                                yolov5EndpointsMapping[item.EndpointName] = industrialModel.id;
                                if(endpointItems.length === response.data.length) {
                                    index++;
                                    yolov5EndpointOptions = yolov5EndpointOptions.concat(endpointItems)
                                    if(index === count) {
                                        setYolov5EndpointOptions(yolov5EndpointOptions);
                                        setYolov5EndpointsMapping(yolov5EndpointsMapping);
                                        setLoadingYolov5(false);
                                        handleLoaded();
                                    }
                                }
                            })
                        }
                    )
                }
            })
        }
    }, [industrialModels, projectSubType, handleLoaded]);

    useEffect(() => {
        if(selectedYolov5Endpoint !== undefined) {
            var industrialModel = industrialModels.find((item) => item.id === yolov5EndpointsMapping[selectedYolov5Endpoint.value]);
            var labels = industrialModel.labels;
            var textFields = [];
            labels.forEach((label) => {
                textFields.push({label: label, value: label})
            })
            setTextFieldOptions(textFields);
            setSelectedTextField(textFields[0]);
        }
    }, [selectedYolov5Endpoint, yolov5EndpointsMapping, industrialModels]);

    const deletePolygonTextById = (textPolygonId: string) => {
        TextActions.deletePolygonTextById(imageData.id, textPolygonId)
    };

    const updatePolygonText = (textPolygonId: string, textNameId: string) => {
        const newImageData = {
            ...imageData,
            textPolygons: imageData.textPolygons
                .map((textPolygon: TextPolygon) => {
                return textPolygon
            })
        };
        updateTextImageDataById(imageData.id, newImageData);
    };

    const getChildren = () => {
        return imageData.textPolygons
            .map((textPolygon: TextPolygon) => {
            return <TextInputField
                size={{
                    width: size.width,
                    height: textInputFieldHeight
                }}
                id={textPolygon.id}
                key={textPolygon.id}
                isActive={textPolygon.id === activeTextId}
                onDelete={deletePolygonTextById}
                value={textPolygon.text}
                onChange={updatePolygonText}
            />
        });
    };

    const onChange = (id, event) => {
        if(id === 'PaddleOCR')
            setSelectedPaddleOCREndpoint({label: event.target.value, value: event.target.value})
        if(id === 'Yolov5')
            setSelectedYolov5Endpoint({label: event.target.value, value: event.target.value})
        if(id === 'TextField')
            setSelectedTextField({label: event.target.value, value: event.target.value})
    }

    const getYolov5Inference = async () => {
        handleProcessing()
    
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

    const getPaddleOCRInference = async (bbox = undefined) => {
        handleProcessing()

        var response = undefined
        if(imageBucket !== undefined && imageKey!== undefined)  {
            response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedPaddleOCREndpoint.value, bucket: imageBucket, key: imageKey, crop: bbox } })
        }
        else if(imageId !== undefined) {
            response = await axios.get(`/_inference/image/${imageId}`, { params : { endpoint_name: selectedPaddleOCREndpoint.value, bucket: imageBucket, key: imageKey, crop: JSON.stringify(bbox) } })
        }
        if(response === undefined)
            return response
        else
            return response.data
    }

    const onInference = () => {
        if(projectSubType === ProjectSubType.OBJECT_DETECTION) 
            getYolov5Inference().then(data => {
                var imageData = TextsSelector.getActiveImageData();
                imageData.textPolygons.splice(0, imageData.textPolygons.length);

                for(let item of data) {
                    var numbers = item.split(' ');
                    var imageId = parseInt(numbers[0]);
                    var x = parseFloat(numbers[1]);
                    var y = parseFloat(numbers[2]);
                    var w = parseFloat(numbers[3]);
                    var h = parseFloat(numbers[4]);
                    var index = textFieldOptions.findIndex((item) => item.value === selectedTextField.value)
                    if(index === imageId) {
                        getPaddleOCRInference({x: x, y: y, w: w, h: h}).then(data => {
                            const imageData: TextImageData = TextsSelector.getActiveImageData();
                            var index = 0;
                            data.bbox.forEach((item) => {
                                var vertices: IPoint[] = [];
                                vertices.push({x: item[0][0], y: item[0][1]});
                                vertices.push({x: item[1][0], y: item[1][1]});
                                vertices.push({x: item[2][0], y: item[2][1]});
                                vertices.push({x: item[3][0], y: item[3][1]});
                                const textPolygon: TextPolygon = TextUtil.createTextPolygon(data.label[index], vertices);
                                imageData.textPolygons.push(textPolygon);
                                store.dispatch(updateActiveTextId(textPolygon.id));
                                index++;
                            })
                            handleProcessed();
                        }, (error) => {
                            handleProcessed();
                        });                
                    }
                }
                handleProcessed();
            }, (error => {
                console.log(error)
                handleProcessed();
            }))
        else
            getPaddleOCRInference().then(data => {
                const imageData: TextImageData = TextsSelector.getActiveImageData();
                var index = 0;
                data.bbox.forEach((item) => {
                    var vertices: IPoint[] = [];
                    vertices.push({x: item[0][0], y: item[0][1]});
                    vertices.push({x: item[1][0], y: item[1][1]});
                    vertices.push({x: item[2][0], y: item[2][1]});
                    vertices.push({x: item[3][0], y: item[3][1]});
                    const textPolygon: TextPolygon = TextUtil.createTextPolygon(data.label[index], vertices);
                    imageData.textPolygons.push(textPolygon);
                    store.dispatch(updateActiveTextId(textPolygon.id));
                    index++;
                })
                handleProcessed();
            }, (error) => {
                console.log(error);
                handleProcessed();
            });
    }

    return (
        <div
            className="PolygonTextsList"
            style={listStyle}
        >
            <Scrollbars>
                <Stack>
                    <div className='Command'>
                        {    
                            (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                            <Typography variant="button" gutterBottom component="div">
                                object detection
                            </Typography>
                        }
                        {
                            (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                            <Select
                                placeholder='Choose an endpoint'
                                selectedOption={selectedYolov5Endpoint}
                                onChange={(event) => onChange('Yolov5', event)}
                                options={yolov5EndpointOptions}
                            />
                        }
                        <Typography variant="button" gutterBottom component="div">
                            text detection
                        </Typography>
                        <Select
                            placeholder='Choose an endpoint'
                            selectedOption={selectedPaddleOCREndpoint}
                            onChange={(event) => onChange('PaddleOCR', event)}
                            options={paddleocrEndpointOptions}
                        />
                        {
                            (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                            <Typography variant="button" gutterBottom component="div">
                                text field
                            </Typography>
                        }
                        {
                            (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                            <Select
                                placeholder='Choose an endpoint'
                                selectedOption={selectedTextField}
                                onChange={(event) => onChange('TextField', event)}
                                options={textFieldOptions}
                            />
                        }
                        <Button variant="primary" size="small" onClick={onInference}>Select and inference</Button>
                        </div>
                </Stack>
                <div
                    className="PolygonTextsListContent"
                    style={listStyleContent}
                >
                    {getChildren()}
                </div>
            </Scrollbars>
        </div>
    );
};

const mapDispatchToProps = {
    updateTextImageDataById
};

const mapStateToProps = (state: AppState) => ({
    activeTextId: state.texts.activeTextId,
    projectSubType: state.general.projectData.subType,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PolygonTextsList);