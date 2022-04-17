import {EditorModel} from "../../staticModels/EditorModel";
import {IRect} from "../../interfaces/IRect";
import {RectUtil} from "../../utils/RectUtil";
import {EditorData} from "../../data/EditorData";
import {CanvasUtil} from "../../utils/CanvasUtil";
import React from "react";
import {IPoint} from "../../interfaces/IPoint";
import {DrawUtil} from "../../utils/DrawUtil";
import {PrimaryEditorRenderEngine} from "../render/PrimaryEditorRenderEngine";
import {ContextManager} from "../context/ContextManager";
import {PointUtil} from "../../utils/PointUtil";
import {ViewPortActions} from "./ViewPortActions";
import {ISize} from "../../interfaces/ISize";
import {ImageUtil} from "../../utils/ImageUtil";
import {GeneralSelector} from "../../store/selectors/GeneralSelector";
import {ViewPortHelper} from "../helpers/ViewPortHelper";
import {CustomCursorStyle} from "../../data/enums/CustomCursorStyle";
import { TextPolygonRenderEngine } from "../render/TextPolygonRenderEngine";

export class TextEditorActions {

    // =================================================================================================================
    // RENDER ENGINES
    // =================================================================================================================

    public static mountTextSupportRenderingEngine() {
        EditorModel.supportRenderingEngine = new TextPolygonRenderEngine(EditorModel.canvas);
    };

    public static swapSupportRenderingEngine() {
        EditorModel.supportRenderingEngine = new TextPolygonRenderEngine(EditorModel.canvas);
    };

    public static mountRenderEnginesAndHelpers() {
        EditorModel.viewPortHelper = new ViewPortHelper();
        EditorModel.primaryRenderingEngine = new PrimaryEditorRenderEngine(EditorModel.canvas);
        TextEditorActions.mountTextSupportRenderingEngine();
    }

    // =================================================================================================================
    // RENDER
    // =================================================================================================================

    public static fullRender() {
        DrawUtil.clearCanvas(EditorModel.canvas);
        EditorModel.primaryRenderingEngine.render(TextEditorActions.getEditorData());
        EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.render(TextEditorActions.getEditorData());
    }

    // =================================================================================================================
    // SETTERS
    // =================================================================================================================

    public static setLoadingStatus(status: boolean) {
        EditorModel.isLoading = status;
    }
    public static setActiveImage(image: HTMLImageElement) {
        EditorModel.image = image;
    }

    public static setViewPortActionsDisabledStatus(status: boolean) {
        EditorModel.viewPortActionsDisabled = status;
    }

    // =================================================================================================================
    // GETTERS
    // =================================================================================================================

    public static getEditorData(event?: Event): EditorData {
        return {
            mousePositionOnViewPortContent: EditorModel.mousePositionOnViewPortContent,
            viewPortContentSize: CanvasUtil.getSize(EditorModel.canvas),
            activeKeyCombo: ContextManager.getActiveCombo(),
            event: event,
            zoom: GeneralSelector.getZoom(),
            viewPortSize: EditorModel.viewPortSize,
            defaultRenderImageRect: EditorModel.defaultRenderImageRect,
            viewPortContentImageRect: ViewPortActions.calculateViewPortContentImageRect(),
            realImageSize: ImageUtil.getSize(EditorModel.image),
            absoluteViewPortContentScrollPosition: ViewPortActions.getAbsoluteScrollPosition()
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    public static updateMousePositionIndicator(event: React.MouseEvent<HTMLCanvasElement, MouseEvent> | MouseEvent) {
        if (!EditorModel.image || !EditorModel.canvas) {
            EditorModel.mousePositionIndicator.style.display = "none";
            EditorModel.cursor.style.display = "none";
            return;
        }

        const mousePositionOverViewPortContent: IPoint = CanvasUtil.getMousePositionOnCanvasFromEvent(event, EditorModel.canvas);
        const viewPortContentScrollPosition: IPoint = ViewPortActions.getAbsoluteScrollPosition();
        const viewPortContentImageRect: IRect = ViewPortActions.calculateViewPortContentImageRect();
        const mousePositionOverViewPort: IPoint = PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentScrollPosition);
        const isMouseOverImage: boolean = RectUtil.isPointInside(viewPortContentImageRect, mousePositionOverViewPortContent);
        const isMouseOverViewPort: boolean = RectUtil.isPointInside({x: 0, y: 0, ...EditorModel.viewPortSize}, mousePositionOverViewPort);

        if (isMouseOverViewPort && !GeneralSelector.getPreventCustomCursorStatus()) {
            EditorModel.cursor.style.left = mousePositionOverViewPort.x + "px";
            EditorModel.cursor.style.top = mousePositionOverViewPort.y + "px";
            EditorModel.cursor.style.display = "block";

            if (isMouseOverImage && ![CustomCursorStyle.GRAB, CustomCursorStyle.GRABBING].includes(GeneralSelector.getCustomCursorStyle())) {
                const imageSize: ISize = ImageUtil.getSize(EditorModel.image);
                const scale: number = imageSize.width / viewPortContentImageRect.width;
                const mousePositionOverImage: IPoint = PointUtil.multiply(
                    PointUtil.subtract(mousePositionOverViewPortContent, viewPortContentImageRect), scale);
                const text: string = "x: " + Math.round(mousePositionOverImage.x) + ", y: " + Math.round(mousePositionOverImage.y);

                EditorModel.mousePositionIndicator.innerHTML = text;
                EditorModel.mousePositionIndicator.style.left = (mousePositionOverViewPort.x + 15) + "px";
                EditorModel.mousePositionIndicator.style.top = (mousePositionOverViewPort.y + 15) + "px";
                EditorModel.mousePositionIndicator.style.display = "block";
            } else {
                EditorModel.mousePositionIndicator.style.display = "none";
            }
        } else {
            EditorModel.cursor.style.display = "none";
            EditorModel.mousePositionIndicator.style.display = "none";
        }
    };
}