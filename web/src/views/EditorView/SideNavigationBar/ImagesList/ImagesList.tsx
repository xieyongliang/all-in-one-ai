import React from 'react';
import { connect } from "react-redux";
import { LabelType } from "../../../../data/enums/LabelType";
import { ISize } from "../../../../interfaces/ISize";
import { AppState } from "../../../../store";
import { LabelImageData, LabelPoint, LabelRect } from "../../../../store/labels/types";
import { VirtualList } from "../../../Common/VirtualList/VirtualList";
import ImagePreview from "../ImagePreview/ImagePreview";
import './ImagesList.scss';
import { ContextManager } from "../../../../logic/context/ContextManager";
import { ContextType } from "../../../../data/enums/ContextType";
import { ImageActions } from "../../../../logic/actions/ImageActions";
import { EventType } from "../../../../data/enums/EventType";
import { LabelStatus } from "../../../../data/enums/LabelStatus";
import { TextImageData } from '../../../../store/texts/types';
import { ProjectType } from '../../../../data/enums/ProjectType';

interface IProps {
    activeLabelImageIndex: number;
    activeTextImageIndex: number;
    labelImageData: LabelImageData[];
    textImageData: TextImageData[];
    activeLabelType: LabelType;
    projectType: ProjectType;
    imageNames: string[];
    imageLabels: string[];
    imageBuckets: string[];
    imageKeys: string[];
}

interface IState {
    size: ISize;
}

class ImagesList extends React.Component<IProps, IState> {
    private imagesListRef: HTMLDivElement;

    constructor(props) {
        super(props);

        this.state = {
            size: null
        }
    }

    public componentDidMount(): void {
        this.updateListSize();
        window.addEventListener(EventType.RESIZE, this.updateListSize);
    }

    public componentWillUnmount(): void {
        window.removeEventListener(EventType.RESIZE, this.updateListSize);
    }

    private updateListSize = () => {
        if (!this.imagesListRef)
            return;

        const listBoundingBox = this.imagesListRef.getBoundingClientRect();
        this.setState({
            size: {
                width: listBoundingBox.width,
                height: listBoundingBox.height
            }
        })
    };

    private isImageChecked = (index:number): boolean => {
        const labelImagelData = this.props.labelImageData[index]
        const textImageData = this.props.textImageData[index]

        if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            return textImageData.textRects.length > 0
        else {
            switch (this.props.activeLabelType) {
                case LabelType.LINE:
                    return labelImagelData.labelLines.length > 0
                case LabelType.IMAGE_RECOGNITION:
                    return labelImagelData.labelNameIds.length > 0
                case LabelType.POINT:
                    return labelImagelData.labelPoints
                        .filter((labelPoint: LabelPoint) => labelPoint.status === LabelStatus.ACCEPTED)
                        .length > 0
                case LabelType.POLYGON:
                    return labelImagelData.labelPolygons.length > 0
                case LabelType.RECT:
                    return labelImagelData.labelRects
                        .filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
                        .length > 0
            }
        }
    };
    
    private onClickHandler = (index: number) => {
        ImageActions.getImageByIndex(index)
    };

    private renderImagePreview = (index: number, isScrolling: boolean, isVisible: boolean, style: React.CSSProperties) => {
        if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            return (
                <ImagePreview
                    key={index}
                    style={style}
                    size={{width: 150, height: 150}}
                    isScrolling={isScrolling}
                    isChecked={this.isImageChecked(index)}
                    imageData={this.props.textImageData[index]}
                    onClick={() => this.onClickHandler(index)}
                    isSelected={this.props.activeTextImageIndex === index}
                />
            )
        else
            return (
                <ImagePreview
                    key={index}
                    style={style}
                    size={{width: 150, height: 150}}
                    isScrolling={isScrolling}
                    isChecked={this.isImageChecked(index)}
                    imageData={this.props.labelImageData[index]}
                    onClick={() => this.onClickHandler(index)}
                    isSelected={this.props.activeLabelImageIndex === index}
                />
            )
    };

    public render() {
        const { size } = this.state;
        return(
            <div
                className="ImagesList"
                ref={ref => this.imagesListRef = ref}
                onClick={() => ContextManager.switchCtx(ContextType.LEFT_NAVBAR)}
            >
                {
                    this.props.projectType !== ProjectType.TEXT_RECOGNITION && 
                    !!size && 
                    <VirtualList
                        size={size}
                        childSize={{width: 150, height: 150}}
                        childCount={this.props.labelImageData.length}
                        childRender={this.renderImagePreview}
                        overScanHeight={200}
                    />
                }
                {
                    this.props.projectType === ProjectType.TEXT_RECOGNITION && 
                    !!size && 
                    <VirtualList
                        size={size}
                        childSize={{width: 150, height: 150}}
                        childCount={this.props.textImageData.length}
                        childRender={this.renderImagePreview}
                        overScanHeight={200}
                    />
                }
            </div>
        )
    }
}

const mapDispatchToProps = {};

const mapStateToProps = (state: AppState) => ({
    activeLabelImageIndex: state.labels.activeImageIndex,
    activeTextImageIndex: state.texts.activeImageIndex,
    labelImageData: state.labels.imagesData,
    textImageData: state.texts.imagesData,
    activeLabelType: state.labels.activeLabelType,
    projectType: state.general.projectData.type
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImagesList);