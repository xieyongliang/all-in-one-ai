import { HotKeyAction } from "../../data/HotKeyAction";
import { EditorModel } from "../../staticModels/EditorModel";
import { LabelType } from "../../data/enums/LabelType";
import { EditorData } from "../../data/EditorData";
import { LabelEditorActions } from "../actions/LabelEditorActions";
import { LabelPolygonRenderEngine } from "../render/LabelPolygonRenderEngine";
import { BaseContext } from "./BaseContext";
import { ImageActions } from "../actions/ImageActions";
import { ViewPortActions } from "../actions/ViewPortActions";
import { Direction } from "../../data/enums/Direction";
import { PlatformUtil } from "../../utils/PlatformUtil";
import { LabelActions } from "../actions/LabelActions";
import { TextActions } from '../actions/TextActions';
import { LineRenderEngine } from "../render/LineRenderEngine";
import { store } from '../../';
import { ProjectType } from "../../data/enums/ProjectType";
import { TextEditorActions } from "../actions/TextEditorActions";
import { TextPolygonRenderEngine } from "../render/TextPolygonRenderEngine";

export class EditorContext extends BaseContext {
    public static actions: HotKeyAction[] = [
        {
            keyCombo: ["Enter"],
            action: (event: KeyboardEvent) => {
                if (EditorModel.supportRenderingEngine && EditorModel.supportRenderingEngine.labelType === LabelType.POLYGON) {
                    const editorData: EditorData = LabelEditorActions.getEditorData();
                    if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION) {
                        (EditorModel.supportRenderingEngine as TextPolygonRenderEngine).addLabelAndFinishCreation(editorData);
                    }
                    else
                        (EditorModel.supportRenderingEngine as LabelPolygonRenderEngine).addLabelAndFinishCreation(editorData);
                }
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: ["Escape"],
            action: (event: KeyboardEvent) => {
                if (EditorModel.supportRenderingEngine) {
                    switch (EditorModel.supportRenderingEngine.labelType) {
                        case LabelType.POLYGON:
                            if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                                (EditorModel.supportRenderingEngine as TextPolygonRenderEngine).cancelLabelCreation();
                            else
                                (EditorModel.supportRenderingEngine as LabelPolygonRenderEngine).cancelLabelCreation();
                            break;
                        case LabelType.LINE:
                            (EditorModel.supportRenderingEngine as LineRenderEngine).cancelLabelCreation();
                            break;
                    }
                }
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "ArrowLeft"] : ["Control", "ArrowLeft"],
            action: (event: KeyboardEvent) => {
                ImageActions.getPreviousImage()
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "ArrowRight"] : ["Control", "ArrowRight"],
            action: (event: KeyboardEvent) => {
                ImageActions.getNextImage();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "+"] : ["Control", "+"],
            action: (event: KeyboardEvent) => {
                ViewPortActions.zoomIn();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "-"] : ["Control", "-"],
            action: (event: KeyboardEvent) => {
                ViewPortActions.zoomOut();
            }
        },
        {
            keyCombo: ["ArrowRight"],
            action: (event: KeyboardEvent) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.RIGHT);
            }
        },
        {
            keyCombo: ["ArrowLeft"],
            action: (event: KeyboardEvent) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.LEFT);
            }
        },
        {
            keyCombo: ["ArrowUp"],
            action: (event: KeyboardEvent) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.BOTTOM);
            }
        },
        {
            keyCombo: ["ArrowDown"],
            action: (event: KeyboardEvent) => {
                event.preventDefault();
                ViewPortActions.translateViewPortPosition(Direction.TOP);
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Backspace"] : ["Delete"],
            action: (event: KeyboardEvent) => {
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextActions.deleteActiveText();
                else
                    LabelActions.deleteActiveLabel();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "0"] : ["Control", "0"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(0);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "1"] : ["Control", "1"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(1);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "2"] : ["Control", "2"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(2);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "3"] : ["Control", "3"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(3);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "4"] : ["Control", "4"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(4);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "5"] : ["Control", "5"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(5);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "6"] : ["Control", "6"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(6);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "7"] : ["Control", "7"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(7);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "8"] : ["Control", "8"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(8);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        },
        {
            keyCombo: PlatformUtil.isMac(window.navigator.userAgent) ? ["Alt", "9"] : ["Control", "9"],
            action: (event: KeyboardEvent) => {
                ImageActions.setActiveLabelOnActiveImage(9);
                if(store.getState().general.projectData.type === ProjectType.TEXT_RECOGNITION)
                    TextEditorActions.fullRender();
                else
                    LabelEditorActions.fullRender();
            }
        }
    ];
}