import React from "react";
import './LabelsToolkit.scss';
import {ImageLabelData} from "../../../../store/labels/types";
import {updateActiveLabelId, updateActiveLabelType, updateImageLabelDataById} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {LabelType} from "../../../../data/enums/LabelType";
import {ProjectType} from "../../../../data/enums/ProjectType";
import {ISize} from "../../../../interfaces/ISize";
import {Settings} from "../../../../settings/Settings";
import RectLabelsList from "../RectLabelsList/RectLabelsList";
import PointLabelsList from "../PointLabelsList/PointLabelsList";
import PolygonLabelsList from "../PolygonLabelsList/PolygonLabelsList";
import {ContextManager} from "../../../../logic/context/ContextManager";
import {ContextType} from "../../../../data/enums/ContextType";
import {EventType} from "../../../../data/enums/EventType";
import LineLabelsList from "../LineLabelsList/LineLabelsList";
import TagLabelsList from "../TagLabelsList/TagLabelsList";

interface IProps {
    activeImageIndex:number,
    activeLabelType: LabelType;
    imagesData: ImageLabelData[];
    projectType: ProjectType;
    onProcessing: () => any;
    onProcessed: () => any;
    imageBucket?: string;
    imageKey?: string;
    imageId?: string;
    imageLabels: string[];
    imageColors: string[];
    imageAnnotations?: string[];
    imageName: string;
    updateImageLabelDataById: (id: string, newImageLabelData: ImageLabelData) => any;
    updateActiveLabelType: (activeLabelType: LabelType) => any;
    updateActiveLabelId: (highlightedLabelId: string) => any;
}

interface IState {
    size: ISize;
}

class LabelsToolkit extends React.Component<IProps, IState> {
    private labelsToolkitRef: HTMLDivElement;
    private readonly tabs: LabelType[];

    constructor(props) {
        super(props);

        this.state = {
            size: null,
        };

        switch(props.projectType) {
            case ProjectType.IMAGE_RECOGNITION: 
                this.tabs = [
                    LabelType.IMAGE_RECOGNITION
                ]
                break;
            case ProjectType.OBJECT_DETECTION_RECT:
                this.tabs = [
                    LabelType.RECT,
                ]
                break;
            case ProjectType.OBJECT_DETECTION_POINT:
                this.tabs = [
                    LabelType.POINT
                ]
                break;
            case ProjectType.OBJECT_DETECTION_LINE:
                this.tabs = [
                    LabelType.LINE
                ]
                break;
            case ProjectType.OBJECT_DETECTION_POLYGON:
                this.tabs = [
                    LabelType.POLYGON
                ]
                break;
            default:
                this.tabs = [
                    LabelType.RECT,
                    LabelType.POINT,
                    LabelType.LINE,
                    LabelType.POLYGON    
                ]
        }

        const activeTab: LabelType = props.activeLabelType ? props.activeLabelType : this.tabs[0];
        props.updateActiveLabelType(activeTab);
    }

    public componentDidMount(): void {
        this.updateToolkitSize();
        window.addEventListener(EventType.RESIZE, this.updateToolkitSize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener(EventType.RESIZE, this.updateToolkitSize);
    }

    private updateToolkitSize = () => {
        if (!this.labelsToolkitRef)
            return;

        const listBoundingBox = this.labelsToolkitRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    };

    private renderChildren = () => {
        const {size} = this.state;
        const {activeImageIndex, imagesData, activeLabelType} = this.props;

        const activeContentHeight: number = size.height - Settings.TOOLKIT_TAB_HEIGHT_PX;

        const content =
                <div
                    key={"Content_" + 0}
                    className={'Content'}
                    style={{height: activeContentHeight}}
                >
                {
                    activeLabelType === LabelType.RECT && 
                    <RectLabelsList
                        size={{
                            width: size.width - 20,
                            height: activeContentHeight - 20
                        }}
                        imageData = {imagesData[activeImageIndex]}
                        imageBucket = {this.props.imageBucket}
                        imageKey = {this.props.imageKey}
                        imageId = {this.props.imageId}
                        imageColors = {this.props.imageColors}
                        imageLabels = {this.props.imageLabels}
                        imageAnnotations = {this.props.imageAnnotations}
                        imageName = {this.props.imageName}
                        onProcessing = {this.props.onProcessing}
                        onProcessed = {this.props.onProcessed}
                    />
                }
                {
                    activeLabelType === LabelType.POINT && <PointLabelsList
                        size={{
                            width: size.width - 20,
                            height: activeContentHeight - 20
                        }}
                        imageData={imagesData[activeImageIndex]}
                    />
                }
                {
                    activeLabelType === LabelType.LINE && <LineLabelsList
                        size={{
                            width: size.width - 20,
                            height: activeContentHeight - 20
                        }}
                        imageData={imagesData[activeImageIndex]}
                    />
                }
                {
                    activeLabelType === LabelType.POLYGON && <PolygonLabelsList
                        size={{
                            width: size.width - 20,
                            height: activeContentHeight - 20
                        }}
                        imageData={imagesData[activeImageIndex]}
                    />
                }
                {
                    activeLabelType === LabelType.IMAGE_RECOGNITION && <TagLabelsList
                        size={{
                            width: size.width - 20,
                            height: activeContentHeight - 20
                        }}
                    imageData={imagesData[activeImageIndex]}
                />}
            </div>
        return content;
    };

    public render() {
        return(
            <div
                className="LabelsToolkit"
                ref={ref => this.labelsToolkitRef = ref}
                onClick={() => ContextManager.switchCtx(ContextType.RIGHT_NAVBAR)}
            >
                {this.state.size && this.renderChildren()}
            </div>
        )
    }
}

const mapDispatchToProps = {
    updateImageLabelDataById,
    updateActiveLabelType,
    updateActiveLabelId
};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.labels.activeImageIndex,
    activeLabelType: state.labels.activeLabelType,
    imagesData: state.labels.imagesData,
    projectType: state.general.projectData.type,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(LabelsToolkit);