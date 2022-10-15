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
import { IIndustrialModel } from '../../../../store/industrialmodels/reducer';
import GenericImageList from "../GenericImageList/GenericImageList";

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
    size: ISize;
}

class GenericImageToolkit extends React.Component<IProps, IState> {
    private genericImageToolkitRef: HTMLDivElement;

    constructor(props) {
        super(props);

        this.state = {
            size: null,
        };
    }

    public componentDidMount(): void {
        this.updateToolkitSize();
        window.addEventListener(EventType.RESIZE, this.updateToolkitSize);
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

    private renderChildren = () => {
        const {size} = this.state;

        const activeContentHeight: number = size.height - Settings.TOOLKIT_TAB_HEIGHT_PX;

        const content =
            <div
                key={"Content_0"}
                className="Content"
                style={{height: activeContentHeight}}
            >
                <GenericImageList
                    size={{
                        width: size.width - 20,
                        height: activeContentHeight - 20
                    }}
                    imageBuckets = {this.props.imageBuckets}
                    imageKeys = {this.props.imageKeys}
                    imageId = {this.props.imageId}
                    onProcessing = {this.props.onProcessing}
                    onProcessed = {this.props.onProcessed}
                    onLoaded = {this.props.onLoaded} 
                />
            </div>;
        
        return content;
    };

    public render() {
        if(this.props.projectSubType === ProjectSubType.IMAGE_PREVIEW)
            this.props.onLoaded();

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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GenericImageToolkit);