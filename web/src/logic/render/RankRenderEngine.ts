import { EditorData } from '../../data/EditorData';
import { BaseRenderEngine } from './BaseRenderEngine';
import { IPoint } from '../../interfaces/IPoint';
import { MouseEventUtil } from '../../utils/MouseEventUtil';
import { EventType } from '../../data/enums/EventType';

export class RankRenderEngine extends BaseRenderEngine {

    // =================================================================================================================
    // STATE
    // =================================================================================================================

    private activePath: IPoint[] = [];
    private resizeAnchorIndex: number = null;

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
    }

    // =================================================================================================================
    // EVENT HANDLERS
    // =================================================================================================================

    public update(data: EditorData): void {
        if (!!data.event) {
            switch (MouseEventUtil.getEventType(data.event)) {
                case EventType.MOUSE_MOVE:
                    this.mouseMoveHandler(data);
                    break;
                case EventType.MOUSE_UP:
                    this.mouseUpHandler(data);
                    break;
                case EventType.MOUSE_DOWN:
                    this.mouseDownHandler(data);
                    break;
                default:
                    break;
            }
        }
    }

    public mouseDownHandler(data: EditorData): void {
    }

    public mouseUpHandler(data: EditorData): void {
    }

    public mouseMoveHandler(data: EditorData): void {
    }


    public isInProgress(): boolean {
        return this.isCreationInProgress() || this.isResizeInProgress();
    }

    private isCreationInProgress(): boolean {
        return this.activePath !== null && this.activePath.length !== 0;
    }

    private isResizeInProgress(): boolean {
        return this.resizeAnchorIndex !== null;
    }

    public render(data: EditorData): void {
    }
}
