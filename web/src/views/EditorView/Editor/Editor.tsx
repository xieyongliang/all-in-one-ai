import React from 'react';
import './Editor.scss';
import { ISize } from '../../../interfaces/ISize';
import { LabelImageData, LabelPoint, LabelRect } from '../../../store/labels/types';
import { FileUtil } from '../../../utils/FileUtil';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import { updateLabelImageDataById } from '../../../store/labels/actionCreators';
import { ImageRepository } from '../../../logic/imageRepository/ImageRepository';
import { LabelType } from '../../../data/enums/LabelType';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { CanvasUtil } from '../../../utils/CanvasUtil';
import { CustomCursorStyle } from '../../../data/enums/CustomCursorStyle';
import { ImageLoadManager } from '../../../logic/imageRepository/ImageLoadManager';
import { EventType } from '../../../data/enums/EventType';
import { EditorData } from '../../../data/EditorData';
import { EditorModel } from '../../../staticModels/EditorModel';
import { LabelEditorActions } from '../../../logic/actions/LabelEditorActions';
import { TextEditorActions } from '../../../logic/actions/TextEditorActions';
import { EditorUtil } from '../../../utils/EditorUtil';
import { ContextManager } from '../../../logic/context/ContextManager';
import { ContextType } from '../../../data/enums/ContextType';
import Scrollbars from 'react-custom-scrollbars';
import { ViewPortActions} from '../../../logic/actions/ViewPortActions';
import { PlatformModel } from '../../../staticModels/PlatformModel';
import LabelControlPanel from '../LabelControlPanel/LabelControlPanel';
import TextControlPanel from '../TextControlPandel/TextControlPanel';
import { IPoint } from '../../../interfaces/IPoint';
import { RenderEngineUtil } from '../../../utils/RenderEngineUtil';
import { LabelStatus } from '../../../data/enums/LabelStatus';
import { isEqual } from 'lodash';
import { AIActions} from '../../../logic/actions/AIActions';
import { ProjectType } from '../../../data/enums/ProjectType';
import { TextRect } from '../../../store/texts/types';
import { GenericImageEditorActions } from '../../../logic/actions/GenericImageEditorActions';

interface IProps {
    size: ISize;
    imageData : any;
    activeLabelType: LabelType;
    updateLabelImageDataById: (id: string, newImageData: LabelImageData) => any;
    activePopupType: PopupWindowType;
    activeLabelId: string;
    customCursorStyle: CustomCursorStyle;
    imageDragMode: boolean;
    zoom: number;
    projectType: string;
}

interface IState {
    viewPortSize: ISize
}

class Editor extends React.Component<IProps, IState> {

    constructor(props) {
        super(props);
        this.state = {
            viewPortSize: {
                width: 0,
                height: 0
            },
        };
    }

    // =================================================================================================================
    // LIFE CYCLE
    // =================================================================================================================

    public componentDidMount(): void {
        this.mountEventListeners();

        const {imageData, activeLabelType} = this.props;

        ContextManager.switchCtx(ContextType.EDITOR);
        if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            TextEditorActions.mountRenderEnginesAndHelpers();
        else if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT)
            LabelEditorActions.mountRenderEnginesAndHelpers(activeLabelType);
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC)
            GenericImageEditorActions.mountRenderEnginesAndHelpers();
        ImageLoadManager.addAndRun(this.loadImage(imageData));
        ViewPortActions.resizeCanvas(this.props.size);
    }

    public componentWillUnmount(): void {
        this.unmountEventListeners();
    }

    public componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<{}>, snapshot?: any): void {
        const {imageData, activeLabelType} = this.props;

        prevProps.imageData.id !== imageData.id && ImageLoadManager.addAndRun(this.loadImage(imageData));

        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT) {
            if (prevProps.activeLabelType !== activeLabelType) {
                LabelEditorActions.swapSupportRenderingEngine(activeLabelType);
                AIActions.detect(imageData.id, ImageRepository.getById(imageData.id));
            }
        }
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION) {
            TextEditorActions.swapSupportRenderingEngine();
            AIActions.detect(imageData.id, ImageRepository.getById(imageData.id));
        }
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC) {
            GenericImageEditorActions.swapSupportRenderingEngine();
        }

        this.updateModelAndRender();
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    private mountEventListeners() {
        window.addEventListener(EventType.MOUSE_MOVE, this.update);
        window.addEventListener(EventType.MOUSE_UP, this.update);
        EditorModel.canvas.addEventListener(EventType.MOUSE_DOWN, this.update);
        EditorModel.canvas.addEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
    }

    private unmountEventListeners() {
        window.removeEventListener(EventType.MOUSE_MOVE, this.update);
        window.removeEventListener(EventType.MOUSE_UP, this.update);
        EditorModel.canvas.removeEventListener(EventType.MOUSE_DOWN, this.update);
        EditorModel.canvas.removeEventListener(EventType.MOUSE_WHEEL, this.handleZoom);
    }

    // =================================================================================================================
    // LOAD IMAGE
    // =================================================================================================================

    private loadImage = async (imageData: LabelImageData): Promise<any> => {
        if (imageData.loadStatus) {
            if(this.props.projectType === ProjectType.IMAGE_GENERIC) {
                GenericImageEditorActions.setActiveImage(ImageRepository.getById(imageData.id));
                this.updateModelAndRender()
            }
            else if(this.props.projectType === ProjectType.TEXT_RECOGNITION) {
                TextEditorActions.setActiveImage(ImageRepository.getById(imageData.id));
                this.updateModelAndRender()
            }
            else if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT){
                LabelEditorActions.setActiveImage(ImageRepository.getById(imageData.id));
                AIActions.detect(imageData.id, ImageRepository.getById(imageData.id));
                this.updateModelAndRender()            
            }
        }
        else {
            if (!EditorModel.isLoading) {
                if(this.props.projectType === ProjectType.IMAGE_GENERIC)
                    GenericImageEditorActions.setLoadingStatus(true);
                else if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT)
                    LabelEditorActions.setLoadingStatus(true);
                else if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.setLoadingStatus(true);
                const saveLoadedImagePartial = (image: HTMLImageElement) => this.saveLoadedImage(image, imageData);
                FileUtil.loadImage(imageData.fileData)
                    .then((image:HTMLImageElement) => saveLoadedImagePartial(image))
                    .catch((error) => this.handleLoadImageError())                    
                
            }
        }
    };

    private saveLoadedImage = (image: HTMLImageElement, imageData: LabelImageData) => {
        imageData.loadStatus = true;
        this.props.updateLabelImageDataById(imageData.id, imageData);
        ImageRepository.storeImage(imageData.id, image);
        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT) {
            LabelEditorActions.setActiveImage(image);
            LabelEditorActions.setLoadingStatus(false);
        }
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION) {
            TextEditorActions.setActiveImage(image);
            TextEditorActions.setLoadingStatus(false);
        }
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC) {
            GenericImageEditorActions.setActiveImage(image);
            GenericImageEditorActions.setLoadingStatus(false);
        }
        AIActions.detect(imageData.id, image);
        this.updateModelAndRender()
    };

    private handleLoadImageError = () => {};

    // =================================================================================================================
    // HELPER METHODS
    // =================================================================================================================

    private updateModelAndRender = () => {
        ViewPortActions.updateViewPortSize();
        ViewPortActions.updateDefaultViewPortImageRect();
        ViewPortActions.resizeViewPortContent();
        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT)
            LabelEditorActions.fullRender();
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            TextEditorActions.fullRender();
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC)
            GenericImageEditorActions.fullRender();
    };

    private update = (event: MouseEvent) => {
        var editorData: EditorData;
        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT)
            editorData = LabelEditorActions.getEditorData(event);
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            editorData = TextEditorActions.getEditorData(event);
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC)
            editorData = GenericImageEditorActions.getEditorData(event);

        EditorModel.mousePositionOnViewPortContent = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
        EditorModel.primaryRenderingEngine.update(editorData);

        if (this.props.imageDragMode) {
            EditorModel.viewPortHelper.update(editorData);
        } else {
            EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.update(editorData);
        }

        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT) {
            !this.props.activePopupType && LabelEditorActions.updateMousePositionIndicator(event);
            LabelEditorActions.fullRender();
        }
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION) {
            !this.props.activePopupType && TextEditorActions.updateMousePositionIndicator(event);
            TextEditorActions.fullRender();
        }
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC) {
            !this.props.activePopupType && LabelEditorActions.updateMousePositionIndicator(event);
            GenericImageEditorActions.fullRender();
        }

    };

    private handleZoom = (event: WheelEvent) => {
        if (event.ctrlKey || (PlatformModel.isMac && event.metaKey)) {
            const scrollSign: number = Math.sign(event.deltaY);
            if ((PlatformModel.isMac && scrollSign === -1) || (!PlatformModel.isMac && scrollSign === 1)) {
                ViewPortActions.zoomOut();
            }
            else if ((PlatformModel.isMac && scrollSign === 1) || (!PlatformModel.isMac && scrollSign === -1)) {
                ViewPortActions.zoomIn();
            }
        }
        EditorModel.mousePositionOnViewPortContent = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
    };

    private getOptionsPanels = () => {
        var editorData: EditorData;

        if(this.props.projectType === ProjectType.OBJECT_DETECTION_RECT)
            editorData = LabelEditorActions.getEditorData()
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION)
            editorData = TextEditorActions.getEditorData()
        else if(this.props.projectType === ProjectType.IMAGE_GENERIC)
            editorData = GenericImageEditorActions.getEditorData()

        if(this.props.projectType === ProjectType.IMAGE_GENERIC) {
            return <div />
        }
        else if(this.props.projectType === ProjectType.TEXT_RECOGNITION) {
            return this.props.imageData.textRects
                .map((textRect: TextRect) => {
                    const positionOnImage: IPoint = {x: textRect.rect.x, y: textRect.rect.y};
                    const positionOnViewPort: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(positionOnImage, editorData);
                    return <TextControlPanel
                        position={positionOnViewPort}
                        textData={textRect}
                        imageData={this.props.imageData}
                        key={textRect.id}
                    />
                })
        }
        else if (this.props.activeLabelType === LabelType.RECT) {
            return this.props.imageData.labelRects
                .filter((labelRect: LabelRect) => labelRect.isCreatedByAI && labelRect.status !== LabelStatus.ACCEPTED)
                .map((labelRect: LabelRect) => {
                    const positionOnImage: IPoint = {x: labelRect.rect.x, y: labelRect.rect.y};
                    const positionOnViewPort: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(positionOnImage, editorData);
                    return <LabelControlPanel
                        position={positionOnViewPort}
                        labelData={labelRect}
                        imageData={this.props.imageData}
                        key={labelRect.id}
                    />
                })
        }
        else if (this.props.activeLabelType === LabelType.POINT) {
            return this.props.imageData.labelPoints
                .filter((labelPoint: LabelPoint) => labelPoint.isCreatedByAI && labelPoint.status !== LabelStatus.ACCEPTED)
                .map((labelPoint: LabelPoint) => {
                    const positionOnImage: IPoint = {x: labelPoint.point.x, y: labelPoint.point.y};
                    const positionOnViewPort: IPoint = RenderEngineUtil.transferPointFromImageToViewPortContent(positionOnImage, editorData);
                    return <LabelControlPanel
                        position={positionOnViewPort}
                        labelData={labelPoint}
                        imageData={this.props.imageData}
                        key={labelPoint.id}
                    />
                })
        }
        else return null;
    };

    private onScrollbarsUpdate = (scrollbarContent)=>{
        const newViewPortContentSize = {
            width: scrollbarContent.scrollWidth,
            height: scrollbarContent.scrollHeight
        };
        if(!isEqual(newViewPortContentSize, this.state.viewPortSize)) {
            this.setState({viewPortSize: newViewPortContentSize})
        }
    };

    public render() {
        return (
            <div
                className='Editor'
                ref={ref => EditorModel.editor = ref}
                draggable={false}
            >
                <Scrollbars
                    ref={ref => EditorModel.viewPortScrollbars = ref}
                    renderTrackHorizontal={props => <div {...props} className='track-horizontal'/>}
                    renderTrackVertical={props => <div {...props} className='track-vertical'/>}
                    onUpdate={this.onScrollbarsUpdate}
                >
                    <div
                        className='ViewPortContent'
                    >
                        <canvas
                            className='ImageCanvas'
                            ref={ref => EditorModel.canvas = ref}
                            draggable={false}
                            onContextMenu={(event: React.MouseEvent<HTMLCanvasElement>) => event.preventDefault()}
                        />
                        {this.getOptionsPanels()}
                    </div>
                </Scrollbars>
                <div
                    className='MousePositionIndicator'
                    ref={ref => EditorModel.mousePositionIndicator = ref}
                    draggable={false}
                />
                <div
                    className={EditorUtil.getCursorStyle(this.props.customCursorStyle)}
                    ref={ref => EditorModel.cursor = ref}
                    draggable={false}
                >
                    <img
                        draggable={false}
                        alt={'indicator'}
                        src={EditorUtil.getIndicator(this.props.customCursorStyle)}
                    />
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = {
    updateLabelImageDataById
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    activeLabelType: state.labels.activeLabelType,
    activePopupType: state.general.activePopupType,
    activeLabelId: state.labels.activeLabelId,
    customCursorStyle: state.general.customCursorStyle,
    imageDragMode: state.general.imageDragMode,
    zoom: state.general.zoom
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Editor);
