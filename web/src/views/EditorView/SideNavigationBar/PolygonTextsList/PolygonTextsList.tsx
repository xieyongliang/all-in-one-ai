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
import { Grid, Typography } from '@mui/material';
import { ProjectSubType } from '../../../../data/enums/ProjectType';
import axios from 'axios';
import { TextsSelector } from '../../../../store/selectors/TextsSelector';
import { TextUtil } from '../../../../utils/TextUtil';
import { store } from '../../../..';
import { Button, Stack, Toggle } from 'aws-northstar';
import { SelectOption } from 'aws-northstar/components/Select';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import { IPoint } from '../../../../interfaces/IPoint';
import { updateReverseLineColor } from '../../../../store/general/actionCreators';
import { useParams } from 'react-router-dom';
import { PathParams } from '../../../../components/Interfaces/PathParams';
import Select from '../../../../components/Utils/Select';
import { useTranslation } from "react-i18next";
import { logOutput } from '../../../../components/Utils/Helper';

interface IProps {
    size: ISize;
    imageData: TextImageData;
    activeTextId: string;
    projectSubType: ProjectSubType;
    reverseLineColor: boolean;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    industrialModels: IIndustrialModel[];
    updateTextImageDataById: (id: string, newImageData: TextImageData) => any;
    updateReverseLineColor: (reverseLineColor: boolean) => any;
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
        reverseLineColor,
        imageBucket,
        imageKey,
        imageId,
        industrialModels,
        updateTextImageDataById,
        updateReverseLineColor,
        onProcessing,
        onProcessed,
        onLoaded
    }) => {
    const [ yolov5EndpointOptions, setYolov5EndpointOptions ] = useState([]);
    const [ extractKeyValues, setExtractKeyValues ] = useState(false);
    const [ keyValues, setKeyValues ] = useState([])
    const [ selectedYolov5Endpoint, setSelectedYolov5Endpoint ] = useState<SelectOption>();
    const [ paddleocrEndpointOptions, setPaddleOCREndpointOptions ] = useState([]);
    const [ selectedPaddleOCREndpoint, setSelectedPaddleOCREndpoint ] = useState<SelectOption>();
    const [ textFieldOptions, setTextFieldOptions ] = useState([]);
    const [ selectedTextField, setSelectedTextField ] = useState<SelectOption>();
    const [ yolov5EndpointsMapping, setYolov5EndpointsMapping ] = useState({});
    const [ loadingYolov5, setLoadingYolov5 ] = useState(true);
    const [ loadingPaddleOCR, setLoadingPaddleOCR ] = useState(true);

    const { t } = useTranslation();

    var processingCount = 0;

    var params : PathParams = useParams();

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
        if(projectSubType === ProjectSubType.OBJECT_DETECTION) {
            var count = industrialModels.filter((industrial_model) => industrial_model.algorithm === 'paddleocr').length;
            if(count === 0) {
                setLoadingPaddleOCR(false);
                handleLoaded();
            }

            var index = 0;
            var paddleocrEndpointItems = [];
            var paddleocrEndpointOptions = [];
            industrialModels.forEach((industrialModel) => {
                if(industrialModel.algorithm === 'paddleocr') {
                    axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                        .then((response) => {
                            var endpointItems = []
                            if(response.data.length === 0) {
                                index++;
                                if(index === count) {
                                    paddleocrEndpointItems.forEach((paddleocrEndpointItem) => {
                                        paddleocrEndpointOptions.push({label: paddleocrEndpointItem, value: paddleocrEndpointItem})
                                    })
                                    setPaddleOCREndpointOptions(paddleocrEndpointOptions);
                                    setLoadingPaddleOCR(false);
                                    handleLoaded();
                                }
                            }
                            response.data.forEach((item) => {
                                endpointItems.push(item.EndpointName)
                                if(endpointItems.length === response.data.length) {
                                    index++;
                                    paddleocrEndpointItems = [...new Set([...paddleocrEndpointItems, ...endpointItems])];
                                    if(index === count) {
                                        paddleocrEndpointItems.forEach((paddleocrEndpointItem) => {
                                            paddleocrEndpointOptions.push({label: paddleocrEndpointItem, value: paddleocrEndpointItem})
                                        })    
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
        }
        else {
            axios.get('/endpoint', {params: { industrial_model: params.id}})
                .then((response) => {
                    var endpointItems = []
                    if(response.data.length === 0) {
                        setLoadingPaddleOCR(false);
                        handleLoaded();
                    }
                    response.data.forEach((item) => {
                        endpointItems.push({label : item.EndpointName, value: item.EndpointName})
                        if(endpointItems.length === response.data.length) {
                            setPaddleOCREndpointOptions(endpointItems);
                            setLoadingPaddleOCR(false);
                            handleLoaded();
                        }
                    })
                }
            )
        }
    }, [industrialModels, handleLoaded, params.id, projectSubType]);

    useEffect(() => {
        if(projectSubType === ProjectSubType.OBJECT_DETECTION) {
            var count = industrialModels.filter((industrial_model) => industrial_model.algorithm === 'yolov5').length;
            var index = 0;
            var yolov5EndpointItems = [];
            var yolov5EndpointOptions = [];
            var yolov5EndpointsMapping = {};
            industrialModels.forEach((industrialModel) => {
                if(industrialModel.algorithm === 'yolov5') {
                    axios.get('/endpoint', {params: { industrial_model: industrialModel.id}})
                        .then((response) => {
                            var endpointItems = []
                            
                            if(response.data.length === 0) {
                                index++;
                                if(index === count) {
                                    setYolov5EndpointOptions(yolov5EndpointOptions);
                                    setYolov5EndpointsMapping(yolov5EndpointsMapping);
                                    setLoadingYolov5(false);
                                    handleLoaded();
                                }
                            }
                            response.data.forEach((item) => {
                                endpointItems.push(item.EndpointName)
                                yolov5EndpointsMapping[item.EndpointName] = industrialModel.id;
                                if(endpointItems.length === response.data.length) {
                                    index++;
                                    yolov5EndpointItems = [...new Set([...yolov5EndpointItems, ...endpointItems])]
                                    if(index === count) {
                                        yolov5EndpointItems.forEach((yolov5EndpointItem) => {
                                            yolov5EndpointOptions.push({label: yolov5EndpointItem, value: yolov5EndpointItem})
                                        })
                                        setYolov5EndpointOptions([...yolov5EndpointOptions]);
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

            var labels = JSON.parse(industrialModel.extra).labels;
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

    const updatePolygonText = (textPolygonId: string, text: string) => {
        const newImageData = {
            ...imageData,
            textPolygons: imageData.textPolygons
                .map((textPolygon: TextPolygon) => {
                if (textPolygon.id === textPolygonId) {
                    return {
                        ...textPolygon,
                        text: text
                    }
                } else {
                    return textPolygon
                }
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

    const onChange = (id, option) => {
        if(id === 'PaddleOCR')
            setSelectedPaddleOCREndpoint(option)
        if(id === 'Yolov5')
            setSelectedYolov5Endpoint(option)
        if(id === 'TextField')
            setSelectedTextField(option)
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

        var industrialModel = industrialModels.find((item) => item.id === params.id);

        var keywords = JSON.parse(industrialModel.extra).keywords
        keywords.forEach(keyword => {
            keywords.push(keyword)
        })

        var response = undefined
        if(imageBucket !== undefined && imageKey!== undefined)  {
            if(extractKeyValues)
                response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedPaddleOCREndpoint.value, bucket: imageBucket, key: imageKey, crop: bbox, post_process: 'ocr_key_value_extraction', keywords: JSON.stringify(keywords) } })
            else
                response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedPaddleOCREndpoint.value, bucket: imageBucket, key: imageKey, crop: bbox } })
        }
        else if(imageId !== undefined) {
            if(extractKeyValues)
                response = await axios.get(`/_inference/image/${imageId}`, { params : { endpoint_name: selectedPaddleOCREndpoint.value, bucket: imageBucket, key: imageKey, crop: JSON.stringify(bbox), post_process: 'ocr_key_value_extraction', keywords: JSON.stringify(keywords) } })
            else
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
                logOutput('alert', error.response.data, undefined, error);
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
                if(extractKeyValues)
                    setKeyValues(data.outputs)
                handleProcessed();
            }, (error) => {
                logOutput('alert', error.response.data, undefined, error);
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
                        <div>
                            {    
                                (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                                <Typography gutterBottom component="div">
                                    {t('industrial_models.demo.select_endpoint_object_detection')}
                                </Typography>
                            }
                        </div>
                        <div>
                            {
                                (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                                <Select
                                    selectedOption={selectedYolov5Endpoint}
                                    onChange={(event) => onChange('Yolov5', event)}
                                    options={yolov5EndpointOptions}
                                />
                            }
                        </div>
                        <div>
                            <Typography gutterBottom component="div">
                            {t('industrial_models.demo.select_endpoint_text_recognition')}
                            </Typography>
                        </div>
                        <div>
                            <Select
                                selectedOption={selectedPaddleOCREndpoint}
                                onChange={(event) => onChange('PaddleOCR', event)}
                                options={paddleocrEndpointOptions}
                            />
                        </div>
                        <div>
                            {
                                (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                                <Typography gutterBottom component="div">
                                    {t('industrial_models.demo.select_text_field')}
                                </Typography>
                            }
                        </div>
                        <div>
                            {
                                (projectSubType === ProjectSubType.OBJECT_DETECTION) && 
                                <Select
                                    selectedOption={selectedTextField}
                                    onChange={(event) => onChange('TextField', event)}
                                    options={textFieldOptions}
                                />
                            }
                        </div>
                        <Button variant="primary" size="small" onClick={onInference}>{t('industrial_models.demo.run')}</Button>
                        <div>
                            <Toggle label={t('industrial_models.demo.reverse_line_color')} checked={reverseLineColor} onChange={(checked)=>updateReverseLineColor(checked)}/>
                            {
                                (projectSubType !== ProjectSubType.OBJECT_DETECTION) &&
                                <Toggle label={t('industrial_models.demo.key_value_extraction')} checked={extractKeyValues} onChange={(checked)=>setExtractKeyValues(checked)}/>
                            }
                        </div>
                    </div>
                </Stack>
                {
                    (projectSubType !== ProjectSubType.OBJECT_DETECTION) && extractKeyValues &&
                    <div 
                        className="PolygonTextsListContent"
                        style={{color: "white", fontSize: '10px', marginLeft: '15px', marginRight: '-2px'}}
                    >
                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 16, md: 16 }}>
                            <Grid item xs={2} sm={6} md={6}>
                                {t('industrial_models.common.key')}
                            </Grid>
                            <Grid item xs={2} sm={10} md={10}>
                                {t('industrial_models.common.value')}
                            </Grid>
                            {
                                keyValues.map((item) => {
                                    return (
                                        <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 16, md: 16 }}>
                                            <Grid item xs={2} sm={6} md={6}>
                                                {item['key']}
                                            </Grid>
                                            <Grid item xs={2} sm={10} md={10}>
                                                {item['value']}
                                            </Grid>
                                        </Grid>
                                    )
                                })
                            }
                        </Grid>
                    </div>
                }
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
    updateTextImageDataById,
    updateReverseLineColor
};

const mapStateToProps = (state: AppState) => ({
    activeTextId: state.texts.activeTextId,
    projectSubType: state.general.projectData.subType,
    reverseLineColor: state.general.reverseLineColor,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PolygonTextsList);