import React from "react";
import './GenericImageToolkit.scss';
import { GenericImageData } from "../../../../store/genericimages/types";
import { updateGenericImageDataById } from "../../../../store/genericimages/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import { ProjectSubType, ProjectType } from "../../../../data/enums/ProjectType";
import { ISize } from "../../../../interfaces/ISize";
import { Settings } from "../../../../settings/Settings";
import { EventType } from "../../../../data/enums/EventType";
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

interface IProps {
    activeImageIndex:number,
    imagesData: GenericImageData[];
    projectType: ProjectType;
    projectSubType: ProjectSubType;
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    imageNames?: string[];
    imageLabels?: string[];
    industrialModels: IIndustrialModel[];
    updateGenericImageDataById: (id: string, newImageData: GenericImageData) => any;
    onProcessing: () => any;
    onProcessed: () => any;
    onLoaded: () => any;
}

interface IState {
    id: string;
    t: any;
    size: ISize;
    endpointOptions: SelectOption[]; 
    selectedEndpointOption: SelectOption;
    classOptions?: SelectOption[];
    selectedClassOption?: SelectOption;
}

function withRouter(Component) {
    function ComponentWithRouter(props) {
        let params = useParams();
        let translation = useTranslation();
        return <Component {...props} params={params} translation={translation} />
    }
    return ComponentWithRouter
  }

class GenericImageToolkit extends React.Component<IProps, IState> {
    private genericImageToolkitRef: HTMLDivElement;

    constructor(props) {
        super(props);

        var industrialModel = this.props.industrialModels.find((item) => item.id === props.params.id);
        
        if(this.props.projectSubType === ProjectSubType.IMAGE_CLASS) {
            var classes = JSON.parse(industrialModel.extra).classes

            this.state = {
                id: props.params.id,
                t: props.translation.t,
                size: null,
                endpointOptions: [],
                selectedEndpointOption: undefined,
                classOptions: classes.map((item) => {
                    return {
                        label: item, 
                        value: item
                    }
                }),
                selectedClassOption: undefined
            };
        }
        else {
            this.state = {
                id: props.params.id,
                t: props.translation.t,
                size: null,
                endpointOptions: [],
                selectedEndpointOption: undefined
            };
        }
    }

    public componentDidMount(): void {
        this.updateToolkitSize();
        window.addEventListener(EventType.RESIZE, this.updateToolkitSize);

        if(this.props.projectSubType === ProjectSubType.IMAGE_TEXT || this.props.projectSubType === ProjectSubType.IMAGE_FLOAT || this.props.projectSubType === ProjectSubType.IMAGE_CLASS  ) {
            axios.get('/endpoint', {params: { industrial_model: this.state.id}})
                .then((response) => {
                    if(response.data.length > 0) {
                        var items = [];
                        response.data.forEach((item) => {
                            items.push({label: item.EndpointName, value: item.EndpointName})
                            if(items.length === response.data.length) {
                                this.setState({'endpointOptions': items, 'selectedEndpointOption': items[0]});
                                this.props.onLoaded();
                            }
                        })
                    }
                    else
                        this.props.onLoaded()

                }
            )
        }
        else
            this.props.onLoaded()
    }

    public componentWillUnmount(): void {
        window.removeEventListener(EventType.RESIZE, this.updateToolkitSize);
    }

    private updateToolkitSize = () => {
        if (!this.genericImageToolkitRef)
            return;

        const listBoundingBox = this.genericImageToolkitRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    }
    
    private onKeyPress = (event) => {
        const {activeImageIndex, imagesData} = this.props;

        if(!/[0-9]/.test(event.key) && (event.key !== '.')) {
            event.preventDefault();
        }

        if(imagesData[activeImageIndex].value.includes('.') && event.key === '.') {
            event.preventDefault();
        }
    }

    private onChange = (id, event) => {
        if(id === 'class') {
            const {activeImageIndex, imagesData, updateGenericImageDataById} = this.props;
            imagesData[activeImageIndex].value = event.value;
            this.setState({'selectedClassOption': event})
            updateGenericImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
        } 
        else if(id === 'id') {
            const {activeImageIndex, imagesData, updateGenericImageDataById} = this.props;
            imagesData[activeImageIndex].value = event.target.value;
            updateGenericImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
        } 
        else if(id === 'endpoint') {
            this.setState({'selectedEndpointOption': event})
        }
    }

    private getInference = async () => {
        this.props.onProcessing()

        var response = undefined
        if(this.props.imageBuckets !== undefined && this.props.imageKeys !== undefined && this.props.imageBuckets[this.props.activeImageIndex] !== undefined && this.props.imageKeys[this.props.activeImageIndex]!== undefined)
            response = await axios.get('/_inference/sample', { params : { endpoint_name: this.state.selectedEndpointOption.value, bucket: this.props.imageBuckets[this.props.activeImageIndex], key: this.props.imageKeys[this.props.activeImageIndex] } })
        else if(this.props.imageId !== undefined)
            response = await axios.get(`/_inference/image/${this.props.imageId}`, { params : { endpoint_name: this.state.selectedEndpointOption.value } })

        if(response === undefined)
            return response
        else
            return response.data
    }

    private onInference = () => {
        this.getInference().then(data => {
            this.setState({'selectedClassOption': this.state.classOptions[parseInt(data.result[0])]})
            this.props.onProcessed()
        }, (error) => {
            logOutput('alert', error.response.data, undefined, error);
            this.props.onProcessed();
        });
    }

    private renderChildren = () => {
        const {size} = this.state;
        const {activeImageIndex, imagesData} = this.props;

        const activeContentHeight: number = size.height - Settings.TOOLKIT_TAB_HEIGHT_PX;
        const content =
            <Scrollbars>
                {
                    (this.props.projectSubType === ProjectSubType.IMAGE_TEXT || this.props.projectSubType === ProjectSubType.IMAGE_FLOAT || this.props.projectSubType === ProjectSubType.IMAGE_CLASS  )&&
                    <div>
                        <div className='Command'>
                            <div className="title">
                                <Typography gutterBottom component="div">
                                    {this.state.t('industrial_models.demo.select_endpoint_object_detection')}
                                </Typography>
                            </div>
                            <div className="endpoint">
                                <Select 
                                    options = {this.state.endpointOptions}
                                    onChange = {(event) => {this.onChange("endpoint", event)}}
                                    selectedOption = {this.state.selectedEndpointOption}
                                />
                            </div>
                            <Button variant='primary' size="small" onClick={this.onInference}>{this.state.t('industrial_models.demo.run')}</Button>
                        </div>
                    </div>
                }
                <div
                    key={"Content_0"}
                    className="Content"
                    style={{height: activeContentHeight}}
                >
                    <div style={{position: "relative", overflow: "hidden", width: "100%", height: "100%", top: "20px", paddingLeft: "10px", paddingRight: "10px", color: "white"}}>
                        <Typography variant="button" gutterBottom component="div">
                            {i18n.t('industrial_models.demo.image_generic')}
                        </Typography>
                        {   
                            (this.props.projectSubType === ProjectSubType.BATCH_IMAGE_TEXT ||  this.props.projectSubType === ProjectSubType.IMAGE_TEXT) &&  
                            <input onChange={(event) => {this.onChange("id", event)}} value={ imagesData[activeImageIndex].value} />
                        }
                        {   
                            (this.props.projectSubType === ProjectSubType.BATCH_IMAGE_FLOAT ||  this.props.projectSubType === ProjectSubType.IMAGE_FLOAT) &&  
                            <input onChange={(event) => {this.onChange("id", event)}} onKeyPress={this.onKeyPress} value={imagesData[activeImageIndex].value} />
                        }
                        {   
                            (this.props.projectSubType === ProjectSubType.BATCH_IMAGE_CLASS ||  this.props.projectSubType === ProjectSubType.IMAGE_CLASS) &&  
                            <Select 
                                options = {this.state.classOptions}
                                onChange = {(event) => {this.onChange("class", event)}}
                                selectedOption = {this.state.selectedClassOption}
                            />
                        }
                    </div>
                </div>;
            </Scrollbars>
        return content;
    };

    public render() {
        return(
            <div
                className="GenericImageToolkit"
                ref={ref => this.genericImageToolkitRef = ref}
            >
                {this.state.size && this.props.projectSubType !== ProjectSubType.IMAGE_PREVIEW && this.renderChildren()}
            </div>
        )
    }
}

const mapDispatchToProps = {
    updateGenericImageDataById
};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.genericimage.activeImageIndex,
    imagesData: state.genericimage.imagesData,
    projectType: state.general.projectData.type,
    projectSubType: state.general.projectData.subType,
    industrialModels : state.industrialmodel.industrialModels
});

const HOCGenericImageToolkit = withRouter(GenericImageToolkit);

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(HOCGenericImageToolkit));