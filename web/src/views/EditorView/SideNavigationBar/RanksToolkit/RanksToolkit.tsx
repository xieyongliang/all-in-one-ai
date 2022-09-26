import React from "react";
import './RanksToolkit.scss';
import { RankImageData } from "../../../../store/ranks/types";
import { updateRankImageDataById } from "../../../../store/ranks/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import { ProjectType } from "../../../../data/enums/ProjectType";
import { ISize } from "../../../../interfaces/ISize";
import { Settings } from "../../../../settings/Settings";
import { EventType } from "../../../../data/enums/EventType";

interface IProps {
    activeImageIndex:number,
    imagesData: RankImageData[];
    projectType: ProjectType;
    imageBuckets?: string[];
    imageKeys?: string[];
    imageId?: string;
    updateRankImageDataById: (id: string, newImageData: RankImageData) => any;
    onProcessing: () => any;
    onProcessed: () => any;
    onLoaded: () => any;
}

interface IState {
    size: ISize;
}

class RanksToolkit extends React.Component<IProps, IState> {
    private ranksToolkitRef: HTMLDivElement;

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
        if (!this.ranksToolkitRef)
            return;

        const listBoundingBox = this.ranksToolkitRef.getBoundingClientRect();
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
                <div >
                    <input value={activeImageIndex}></input>
                </div>
            </div>;
        return content;
    };

    public render() {
        return(
            <div
                className="RanksToolkit"
                ref={ref => this.ranksToolkitRef = ref}
            >
                {this.state.size && this.renderChildren()}
            </div>
        )
    }
}

const mapDispatchToProps = {
    updateRankImageDataById
};

const mapStateToProps = (state: AppState) => ({
    activeImageIndex: state.ranks.activeImageIndex,
    imagesData: state.ranks.imagesData,
    projectType: state.general.projectData.type
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RanksToolkit);