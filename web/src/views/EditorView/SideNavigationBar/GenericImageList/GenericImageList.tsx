import React, { useEffect, useState } from "react";
import './GenericImageList.scss';
import { GenericImageData } from "../../../../store/genericimages/types";
import { updateGenericImageDataById } from "../../../../store/genericimages/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import { ProjectSubType } from "../../../../data/enums/ProjectType";
import { ISize } from "../../../../interfaces/ISize";
import { Typography } from "@material-ui/core";
import Select from '../../../../components/Utils/Select';
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import Scrollbars from 'react-custom-scrollbars';
import i18n from "i18next";
import { useParams } from "react-router-dom";
import { Button } from "aws-northstar";
import { useTranslation } from "react-i18next";
import { SelectOption } from "aws-northstar/components/Select";
import axios from "axios";
import { logOutput } from "../../../../components/Utils/Helper";
import { PathParams } from "../../../../components/Interfaces/PathParams";

interface IProps {
    size: ISize;
    activeImageIndex:number,
    imagesData: GenericImageData[];
    projectSubType: ProjectSubType;
    industrialModels: IIndustrialModel[];
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    updateGenericImageDataById: (id: string, newImageData: GenericImageData) => any;
    onProcessing: () => any;
    onProcessed: () => any;
    onLoaded: () => any;
}

const GenericImageList: React.FC<IProps> = (
    {
        size,
        activeImageIndex,
        imagesData,
        projectSubType,
        imageBuckets,
        imageKeys,
        imageId,
        industrialModels,
        updateGenericImageDataById,
        onProcessing,
        onProcessed,
        onLoaded
    }) => {
    const [ endpointOptions, setEndpointOptions ] = useState([]);
    const [ selectedEndpointOption, setSelectedEndpointOption ] = useState<SelectOption>();
    const [ selectedClassOption, setSelectedClassOption ] = useState<SelectOption>();
    
    const { t } = useTranslation();

    var params : PathParams = useParams();
    var industrialModel = industrialModels.find((item) => item.id === params.id);

    var classes = (projectSubType === ProjectSubType.IMAGE_CLASS) ? JSON.parse(industrialModel.extra).classes : undefined;

    const classOptions = (classes !== undefined) ? 
        classes.map((item) => {
            return {
                label: item, 
                value: item
            }
        }) : [];

    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };

    useEffect(() => {
        if(projectSubType === ProjectSubType.IMAGE_TEXT || projectSubType === ProjectSubType.IMAGE_FLOAT || projectSubType === ProjectSubType.IMAGE_CLASS  ) {
            axios.get('/endpoint', {params: { industrial_model: params.id}})
                .then((response) => {
                    if(response.data.length > 0) {
                        var items = [];
                        response.data.forEach((item) => {
                            items.push({label: item.EndpointName, value: item.EndpointName})
                            if(items.length === response.data.length) {
                                setEndpointOptions(items)
                                setSelectedEndpointOption(items[0])
                                onLoaded();
                            }
                        })
                    }
                    else
                        onLoaded()
                }
            )
        }
        else
            onLoaded()

    }, [params.id, onLoaded, projectSubType]);

    const onChange = (id, event) => {
        if(id === 'class') {
            console.log(event)
            imagesData[activeImageIndex].value = event.value;

            setSelectedClassOption(event);
            updateGenericImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
        } 
        else if(id === 'id') {
            if(projectSubType === ProjectSubType.BATCH_IMAGE_FLOAT || projectSubType === ProjectSubType.IMAGE_FLOAT) {
                if(/^[-+]?[0-9]*\.?[0-9]*([eE][-+]?[0-9]+)?$/.test(event.target.value)) {
                    imagesData[activeImageIndex].value = event.target.value;
                    updateGenericImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
                }
            }
            else {
                imagesData[activeImageIndex].value = event.target.value;
                updateGenericImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
            }
        } 
        else if(id === 'endpoint') {
            setSelectedEndpointOption({label: event.value, value: event.value});
        }
    }

    const getInference = async () => {
        onProcessing()

        var response = undefined
        if(imageBuckets !== undefined && imageKeys !== undefined && imageBuckets[activeImageIndex] !== undefined && imageKeys[activeImageIndex]!== undefined)
            response = await axios.get('/_inference/sample', { params : { endpoint_name: selectedEndpointOption.value, bucket: imageBuckets[activeImageIndex], key: imageKeys[activeImageIndex] } })
        else if(imageId !== undefined)
            response = await axios.get(`/_inference/image/${imageId}`, { params : { endpoint_name: selectedEndpointOption.value } })

        if(response === undefined)
            return response
        else
            return response.data
    }

    const onInference = () => {
        getInference().then(data => {
            setSelectedClassOption(classOptions[parseInt(data.result[0])])
            onProcessed();
        }, (error) => {
            logOutput('alert', error.response.data, undefined, error);
            onProcessed();
        });
    }


    return (
        <div
            className="GenericImageList"
            style={listStyle}
        >
            <Scrollbars>
                <div className='Command'>
                    {
                        (projectSubType === ProjectSubType.IMAGE_TEXT || projectSubType === ProjectSubType.IMAGE_FLOAT || projectSubType === ProjectSubType.IMAGE_CLASS  )&&
                        <div className="title">
                            <Typography gutterBottom component="div">
                                {t('industrial_models.demo.select_endpoint_object_detection')}
                            </Typography>
                        </div>
                    }
                    {
                        (projectSubType === ProjectSubType.IMAGE_TEXT || projectSubType === ProjectSubType.IMAGE_FLOAT || projectSubType === ProjectSubType.IMAGE_CLASS  )&&
                        <div className="endpoint">
                            <Select 
                                options = {endpointOptions}
                                onChange = {(event) => {onChange("endpoint", event)}}
                                selectedOption = {selectedEndpointOption}
                            />
                            <Button variant='primary' size="small" onClick={onInference}>{t('industrial_models.demo.run')}</Button>
                        </div>
                    }
                    <Typography variant="button" gutterBottom component="div">
                        {i18n.t('industrial_models.demo.image_generic')}
                    </Typography>
                    {   
                        (projectSubType === ProjectSubType.BATCH_IMAGE_TEXT ||  projectSubType === ProjectSubType.IMAGE_TEXT) &&  
                        <input onChange={(event) => {onChange("id", event)}} value={ imagesData[activeImageIndex].value} />
                    }
                    {   
                        (projectSubType === ProjectSubType.BATCH_IMAGE_FLOAT ||  projectSubType === ProjectSubType.IMAGE_FLOAT) &&  
                        <input onChange={(event) => {onChange("id", event)}} value={imagesData[activeImageIndex].value} />
                    }
                    {   
                        (projectSubType === ProjectSubType.BATCH_IMAGE_CLASS ||  projectSubType === ProjectSubType.IMAGE_CLASS) &&  
                        <Select 
                            options = {classOptions}
                            onChange = {(event) => {onChange("class", event)}}
                            selectedOption = {selectedClassOption}
                        />
                    }
                </div>
            </Scrollbars>
        </div>
    );
};

const mapDispatchToProps = {
    updateGenericImageDataById
};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.genericimage.activeImageIndex,
    imagesData: state.genericimage.imagesData,
    projectSubType: state.general.projectData.subType,
    industrialModels : state.industrialmodel.industrialModels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenericImageList);