import React from "react";
import './RanksToolkit.scss';
import { RankImageData } from "../../../../store/ranks/types";
import { updateRankImageDataById } from "../../../../store/ranks/actionCreators";
import { AppState } from "../../../../store";
import { connect } from "react-redux";
import { ProjectSubType, ProjectType } from "../../../../data/enums/ProjectType";
import { ISize } from "../../../../interfaces/ISize";
import { Settings } from "../../../../settings/Settings";
import { EventType } from "../../../../data/enums/EventType";
import { Typography } from "@material-ui/core";
import Select from '../../../../components/Utils/Select';
import i18n from "i18next";

interface IProps {
    activeImageIndex:number,
    imagesData: RankImageData[];
    projectType: ProjectType;
    projectSubType: ProjectSubType;
    imageNames?: string[];
    imageLabels?: string[];
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
            size: null
        };

        props.onLoaded();
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
    }
    
    private onKeyPress = (event) => {
        const {activeImageIndex, imagesData} = this.props;

        if(!/[0-9]/.test(event.key) && (event.key !== '.')) {
            event.preventDefault();
        }

        console.log(imagesData[activeImageIndex].rank)
        console.log(imagesData[activeImageIndex].rank.includes('.'))
        if(imagesData[activeImageIndex].rank.includes('.') && event.key === '.') {
            event.preventDefault();
        }
    }

    private onChange = (event) => {
        const {activeImageIndex, imagesData, updateRankImageDataById} = this.props;
        imagesData[activeImageIndex].rank = event.target.value;
        updateRankImageDataById(imagesData[activeImageIndex].id, imagesData[activeImageIndex]);
    }

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
                <div style={{position: "relative", overflow: "hidden", width: "100%", height: "100%", top: "20px", paddingLeft: "10px", paddingRight: "10px", color: "white"}}>
                    <Typography variant="button" gutterBottom component="div">
                        {i18n.t('industrial_models.demo.image_rank')}
                    </Typography>
                    {   
                        (this.props.projectSubType === ProjectSubType.BATCH_RANK_TEXT ||  this.props.projectSubType === ProjectSubType.IMAGE_RANK_TEXT) &&  
                        <input onChange={this.onChange} value={ imagesData[activeImageIndex].rank} />
                    }
                    {   
                        (this.props.projectSubType === ProjectSubType.BATCH_RANK_FLOAT ||  this.props.projectSubType === ProjectSubType.IMAGE_RANK_FLOAT) &&  
                        <input onChange={this.onChange} onKeyPress={this.onKeyPress} value={imagesData[activeImageIndex].rank} />
                    }
                    {   
                        (this.props.projectSubType === ProjectSubType.BATCH_RANK_CLASS ||  this.props.projectSubType === ProjectSubType.IMAGE_RANK_CLASS) &&  
                        <Select 
                            options = {this.props.imageLabels.map((item) => {
                                return {
                                    label: item, 
                                    value: item
                                }
                            })}
                            onChange = {this.onChange}
                        />
                    }
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
    projectType: state.general.projectData.type,
    projectSubType: state.general.projectData.subType
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RanksToolkit);