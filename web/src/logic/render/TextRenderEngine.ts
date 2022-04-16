import { IPoint } from '../../interfaces/IPoint';
import { IRect } from '../../interfaces/IRect';
import { RectUtil } from '../../utils/RectUtil';
import { DrawUtil } from '../../utils/DrawUtil';
import { store } from '../..';
import { TextImageData, TextRect } from '../../store/texts/types';
import { PointUtil } from '../../utils/PointUtil';
import { RectAnchor } from '../../data/RectAnchor';
import { RenderEngineSettings } from '../../settings/RenderEngineSettings';
import { updateCustomCursorStyle } from '../../store/general/actionCreators';
import { CustomCursorStyle } from '../../data/enums/CustomCursorStyle';
import { EditorData } from '../../data/EditorData';
import { BaseRenderEngine } from './BaseRenderEngine';
import { RenderEngineUtil } from '../../utils/RenderEngineUtil';
import { TextEditorActions } from '../actions/TextEditorActions';
import { GeneralSelector } from '../../store/selectors/GeneralSelector';
import { TextUtil } from '../../utils/TextUtil';
import { TextsSelector } from '../../store/selectors/TextsSelector';
import { updateActiveTextId, updateTextImageDataById, updateHighlightedTextId } from '../../store/texts/actionCreators';

export class TextRenderEngine extends BaseRenderEngine {

    // =================================================================================================================
    // STATE
    // =================================================================================================================

    private startCreateRectPoint: IPoint;
    private startResizeRectAnchor: RectAnchor;

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.labelType = undefined
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    public mouseDownHandler = (data: EditorData) => {
        const isMouseOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
        const isMouseOverCanvas: boolean = RenderEngineUtil.isMouseOverCanvas(data);
        if (isMouseOverCanvas) {
            const rectUnderMouse: TextRect = this.getRectUnderMouse(data);
            if (!!rectUnderMouse) {
                const rect: IRect = this.calculateRectRelativeToActiveImage(rectUnderMouse.rect, data);
                const anchorUnderMouse: RectAnchor = this.getAnchorUnderMouseByRect(rect, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
                if (!!anchorUnderMouse) {
                    store.dispatch(updateActiveTextId(rectUnderMouse.id));
                    this.startRectResize(anchorUnderMouse);
                } else {
                    if (!!TextsSelector.getHighlightedTextId())
                        store.dispatch(updateActiveTextId(TextsSelector.getHighlightedTextId()));
                    else
                        this.startRectCreation(data.mousePositionOnViewPortContent);
                }
            } else if (isMouseOverImage) {

                this.startRectCreation(data.mousePositionOnViewPortContent);
            }
        }
    };

    public mouseUpHandler = (data: EditorData) => {
        if (!!data.viewPortContentImageRect) {
            const mousePositionSnapped: IPoint = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const activeTextRect: TextRect = TextsSelector.getActiveRectText();

            if (!!this.startCreateRectPoint && !PointUtil.equals(this.startCreateRectPoint, mousePositionSnapped)) {
                const minX: number = Math.min(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const minY: number = Math.min(this.startCreateRectPoint.y, mousePositionSnapped.y);
                const maxX: number = Math.max(this.startCreateRectPoint.x, mousePositionSnapped.x);
                const maxY: number = Math.max(this.startCreateRectPoint.y, mousePositionSnapped.y);

                const rect = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};
                this.addRectText(RenderEngineUtil.transferRectFromImageToViewPortContent(rect, data));
            }

            if (!!this.startResizeRectAnchor && !!activeTextRect) {
                const rect: IRect = this.calculateRectRelativeToActiveImage(activeTextRect.rect, data);
                const startAnchorPosition: IPoint = PointUtil.add(this.startResizeRectAnchor.position,
                    data.viewPortContentImageRect);
                const delta: IPoint = PointUtil.subtract(mousePositionSnapped, startAnchorPosition);
                const resizeRect: IRect = RectUtil.resizeRect(rect, this.startResizeRectAnchor.type, delta);
                const scale: number = RenderEngineUtil.calculateImageScale(data);
                const scaledRect: IRect = RectUtil.scaleRect(resizeRect, scale);

                const imageData = TextsSelector.getActiveImageData();
                imageData.textRects = imageData.textRects.map((textRect: TextRect) => {
                    if (textRect.id === activeTextRect.id) {
                        return {
                            ...textRect,
                            rect: scaledRect
                        };
                    }
                    return textRect;
                });
                store.dispatch(updateTextImageDataById(imageData.id, imageData));
            }
        }
        this.endRectTransformation()
    };

    public mouseMoveHandler = (data: EditorData) => {
        if (!!data.viewPortContentImageRect && !!data.mousePositionOnViewPortContent) {
            const isOverImage: boolean = RenderEngineUtil.isMouseOverImage(data);
            if (isOverImage && !this.startResizeRectAnchor) {
                const textRect: TextRect = this.getRectUnderMouse(data);
                if (!!textRect && !this.isInProgress()) {
                    if (TextsSelector.getHighlightedTextId() !== textRect.id) {
                        store.dispatch(updateHighlightedTextId(textRect.id))
                    }
                } else {
                    if (TextsSelector.getHighlightedTextId() !== null) {
                        store.dispatch(updateHighlightedTextId(null))
                    }
                }
            }
        }
    };

    // =================================================================================================================
    // RENDERING
    // =================================================================================================================

    public render(data: EditorData) {
        const activeTextId: string = TextsSelector.getActiveTextId();
        const imageData: TextImageData = TextsSelector.getActiveImageData();
        if (imageData) {
            imageData.textRects.forEach((textRect: TextRect) => {
                if (textRect.id === activeTextId) {
                    this.drawActiveRect(textRect, data)
                } else {
                    this.drawInactiveRect(textRect, data);
                }
            });
            this.drawCurrentlyCreatedRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            this.updateCursorStyle(data);
        }
    }

    private drawCurrentlyCreatedRect(mousePosition: IPoint, imageRect: IRect) {
        if (!!this.startCreateRectPoint) {
            const mousePositionSnapped: IPoint = RectUtil.snapPointToRect(mousePosition, imageRect);
            const activeRect: IRect = {
                x: this.startCreateRectPoint.x,
                y: this.startCreateRectPoint.y,
                width: mousePositionSnapped.x - this.startCreateRectPoint.x,
                height: mousePositionSnapped.y - this.startCreateRectPoint.y
            };
            const activeRectBetweenPixels = RenderEngineUtil.setRectBetweenPixels(activeRect);
            const lineColor: string = BaseRenderEngine.resolveTextLineColor('')
            DrawUtil.drawRect(this.canvas, activeRectBetweenPixels, lineColor, RenderEngineSettings.LINE_THICKNESS);
        }
    }

    private drawInactiveRect(textRect: TextRect, data: EditorData) {
        const rectOnImage: IRect = RenderEngineUtil.transferRectFromViewPortContentToImage(textRect.rect, data)
        const highlightedTextId: string = TextsSelector.getHighlightedTextId()
        const displayAsActive: boolean = textRect.id === highlightedTextId;
        const lineColor: string = BaseRenderEngine.resolveTextLineColor(textRect.text)
        const anchorColor: string = BaseRenderEngine.resolveTextAnchorColor(displayAsActive);
        this.renderRect(rectOnImage, displayAsActive, lineColor, anchorColor);
    }

    private drawActiveRect(textRect: TextRect, data: EditorData) {
        let rect: IRect = this.calculateRectRelativeToActiveImage(textRect.rect, data);
        if (!!this.startResizeRectAnchor) {
            const startAnchorPosition: IPoint = PointUtil.add(this.startResizeRectAnchor.position, data.viewPortContentImageRect);
            const endAnchorPositionSnapped: IPoint = RectUtil.snapPointToRect(data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            const delta = PointUtil.subtract(endAnchorPositionSnapped, startAnchorPosition);
            rect = RectUtil.resizeRect(rect, this.startResizeRectAnchor.type, delta);
        }
        const rectOnImage: IRect = RectUtil.translate(rect, data.viewPortContentImageRect);
        const lineColor: string = BaseRenderEngine.resolveTextLineColor(textRect.text)
        const anchorColor: string = BaseRenderEngine.resolveTextAnchorColor(true);
        this.renderRect(rectOnImage, true, lineColor, anchorColor);
    }

    private renderRect(rectOnImage: IRect, isActive: boolean, lineColor: string, anchorColor: string) {
        const rectBetweenPixels = RenderEngineUtil.setRectBetweenPixels(rectOnImage);
        DrawUtil.drawRect(this.canvas, rectBetweenPixels, lineColor, RenderEngineSettings.LINE_THICKNESS);
    }

    private updateCursorStyle(data: EditorData) {
        if (!!this.canvas && !!data.mousePositionOnViewPortContent && !GeneralSelector.getImageDragModeStatus()) {
            const rectUnderMouse: TextRect = this.getRectUnderMouse(data);
            const rectAnchorUnderMouse: RectAnchor = this.getAnchorUnderMouse(data);
            if ((!!rectAnchorUnderMouse && rectUnderMouse) || !!this.startResizeRectAnchor) {
                store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                return;
            }
            else if (RenderEngineUtil.isMouseOverCanvas(data)) {
                if (!RenderEngineUtil.isMouseOverImage(data) && !!this.startCreateRectPoint)
                    store.dispatch(updateCustomCursorStyle(CustomCursorStyle.MOVE));
                else
                    RenderEngineUtil.wrapDefaultCursorStyleInCancel(data);
                this.canvas.style.cursor = 'none';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    // =================================================================================================================
    // HELPERS
    // =================================================================================================================

    public isInProgress(): boolean {
        return !!this.startCreateRectPoint || !!this.startResizeRectAnchor;
    }

    private calculateRectRelativeToActiveImage(rect: IRect, data: EditorData):IRect {
        const scale: number = RenderEngineUtil.calculateImageScale(data);
        return RectUtil.scaleRect(rect, 1/scale);
    }

    private addRectText = (rect: IRect) => {
        const imageData: TextImageData = TextsSelector.getActiveImageData();
        const textRect: TextRect = TextUtil.createTextRect('', rect);
        imageData.textRects.push(textRect);
        store.dispatch(updateActiveTextId(textRect.id));
    };

    private getRectUnderMouse(data: EditorData): TextRect {
        const activeRectText: TextRect = TextsSelector.getActiveRectText();
        if (!!activeRectText && this.isMouseOverRectEdges(activeRectText.rect, data)) {
            return activeRectText;
        }

        const textRects: TextRect[] = TextsSelector.getActiveImageData().textRects;
        for (let i = 0; i < textRects.length; i++) {
            if (this.isMouseOverRectEdges(textRects[i].rect, data)) {
                return textRects[i];
            }
        }
        return null;
    }

    private isMouseOverRectEdges(rect: IRect, data: EditorData): boolean {
        const rectOnImage: IRect = RectUtil.translate(
            this.calculateRectRelativeToActiveImage(rect, data), data.viewPortContentImageRect);

        const outerRectDelta: IPoint = {
            x: RenderEngineSettings.anchorHoverSize.width / 2,
            y: RenderEngineSettings.anchorHoverSize.height / 2
        };
        const outerRect: IRect = RectUtil.expand(rectOnImage, outerRectDelta);

        const innerRectDelta: IPoint = {
            x: - RenderEngineSettings.anchorHoverSize.width / 2,
            y: - RenderEngineSettings.anchorHoverSize.height / 2
        };
        const innerRect: IRect = RectUtil.expand(rectOnImage, innerRectDelta);

        return (RectUtil.isPointInside(outerRect, data.mousePositionOnViewPortContent) &&
            !RectUtil.isPointInside(innerRect, data.mousePositionOnViewPortContent));
    }

    private getAnchorUnderMouseByRect(rect: IRect, mousePosition: IPoint, imageRect: IRect): RectAnchor {
        const rectAnchors: RectAnchor[] = RectUtil.mapRectToAnchors(rect);
        for (let i = 0; i < rectAnchors.length; i++) {
            const anchorRect: IRect = RectUtil.translate(RectUtil.getRectWithCenterAndSize(rectAnchors[i].position, RenderEngineSettings.anchorHoverSize), imageRect);
            if (!!mousePosition && RectUtil.isPointInside(anchorRect, mousePosition)) {
                return rectAnchors[i];
            }
        }
        return null;
    }

    private getAnchorUnderMouse(data: EditorData): RectAnchor {
        const textRects: TextRect[] = TextsSelector.getActiveImageData().textRects;
        for (let i = 0; i < textRects.length; i++) {
            const rect: IRect = this.calculateRectRelativeToActiveImage(textRects[i].rect, data);
            const rectAnchor = this.getAnchorUnderMouseByRect(rect, data.mousePositionOnViewPortContent, data.viewPortContentImageRect);
            if (!!rectAnchor) return rectAnchor;
        }
        return null;
    }

    private startRectCreation(mousePosition: IPoint) {
        this.startCreateRectPoint = mousePosition;
        store.dispatch(updateActiveTextId(null));
        TextEditorActions.setViewPortActionsDisabledStatus(true);
    }

    private startRectResize(activatedAnchor: RectAnchor) {
        this.startResizeRectAnchor = activatedAnchor;
        TextEditorActions.setViewPortActionsDisabledStatus(true);
    }

    private endRectTransformation() {
        this.startCreateRectPoint = null;
        this.startResizeRectAnchor = null;
        TextEditorActions.setViewPortActionsDisabledStatus(false);
    }
}
