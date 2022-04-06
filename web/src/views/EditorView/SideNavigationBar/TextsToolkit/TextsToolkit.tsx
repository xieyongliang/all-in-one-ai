import React from "react";
import './TextsToolkit.scss';
import {ImageTextData} from "../../../../store/texts/types";
import {updateImageTextDataById} from "../../../../store/texts/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import {LabelType} from "../../../../data/enums/LabelType";
import {ProjectType} from "../../../../data/enums/ProjectType";
import {ISize} from "../../../../interfaces/ISize";
import {Settings} from "../../../../settings/Settings";
import {EventType} from "../../../../data/enums/EventType";
import RectTextsList from "../RectTextsList/RectTextsList";

interface IProps {
    activeImageIndex:number,
    imagesData: ImageTextData[];
    projectType: ProjectType;
    updateImageTextDataById: (id: string, newImageData: ImageTextData) => any;
}

interface IState {
    size: ISize;
}

class TextsToolkit extends React.Component<IProps, IState> {
    private textsToolkitRef: HTMLDivElement;
    private readonly tabs: LabelType[];

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
        if (!this.textsToolkitRef)
            return;

        const listBoundingBox = this.textsToolkitRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    };

    private renderChildren = () => {
        const {size} = this.state;
        const {activeImageIndex, imagesData} = this.props;
        
        const activeContentHeight: number = size.height - Settings.TOOLKIT_TAB_HEIGHT_PX;
        const content =
            <div
                key={"Content_0"}
                className="Content"
                style={{height: activeContentHeight}}
            >
                <RectTextsList
                    size={{
                        width: size.width - 20,
                        height: activeContentHeight - 20
                    }}
                    imageData={imagesData[activeImageIndex]}
                />
            </div>;
        return content;
    };

    public render() {
        return(
            <div
                className="TextsToolkit"
                ref={ref => this.textsToolkitRef = ref}
            >
                {this.state.size && this.renderChildren()}
            </div>
        )
    }
}

const mapDispatchToProps = {
    updateImageTextDataById
};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.texts.activeImageIndex,
    imagesData: state.texts.imagesData,
    projectType: state.general.projectData.type,
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TextsToolkit);