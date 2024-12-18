import {ISize} from '../../interfaces/ISize';
import {Action} from '../Actions';
import {PopupWindowType} from '../../data/enums/PopupWindowType';
import {CustomCursorStyle} from '../../data/enums/CustomCursorStyle';
import {ContextType} from '../../data/enums/ContextType';
import {ProjectSubType, ProjectType} from '../../data/enums/ProjectType';

export type ProjectData = {
    type: ProjectType;
    subType: ProjectSubType;
    name: string;
}

export type GeneralState = {
    windowSize: ISize;
    activePopupType: PopupWindowType;
    customCursorStyle: CustomCursorStyle;
    preventCustomCursor: boolean;
    imageDragMode: boolean;
    crossHairVisible: boolean;
    reverseLineColor: boolean;
    enablePerClassColoration: boolean;
    activeContext: ContextType;
    projectData: ProjectData;
    zoom: number;
    env: Object;
    messages: Object[];
    href: string;
}

interface UpdateProjectData {
    type: typeof Action.UPDATE_PROJECT_DATA;
    payload: {
        projectData: ProjectData;
    }
}

interface UpdateWindowSize {
    type: typeof Action.UPDATE_WINDOW_SIZE;
    payload: {
        windowSize: ISize;
    }
}

interface UpdateActivePopupType {
    type: typeof Action.UPDATE_ACTIVE_POPUP_TYPE;
    payload: {
        activePopupType: PopupWindowType;
    }
}

interface UpdateCustomCursorStyle {
    type: typeof Action.UPDATE_CUSTOM_CURSOR_STYLE;
    payload: {
        customCursorStyle: CustomCursorStyle;
    }
}

interface UpdateActiveContext {
    type: typeof Action.UPDATE_CONTEXT;
    payload: {
        activeContext: ContextType;
    }
}

interface UpdatePreventCustomCursorStatus {
    type: typeof Action.UPDATE_PREVENT_CUSTOM_CURSOR_STATUS;
    payload: {
        preventCustomCursor: boolean;
    }
}

interface UpdateImageDragModeStatus {
    type: typeof Action.UPDATE_IMAGE_DRAG_MODE_STATUS;
    payload: {
        imageDragMode: boolean;
    }
}

interface UpdateCrossHairVisibleStatus {
    type: typeof Action.UPDATE_CROSS_HAIR_VISIBLE_STATUS;
    payload: {
        crossHairVisible: boolean;
    }
}

interface updateReverseLineColor {
    type: typeof Action.UPDATE_REVERSE_LINE_COLOR;
    payload: {
        reverseLineColor: boolean;
    }
}

interface UpdateZoom {
    type: typeof Action.UPDATE_ZOOM,
    payload: {
        zoom: number;
    }
}

interface UpdatePerClassColoration {
    type: typeof Action.UPDATE_ENABLE_PER_CLASS_COLORATION_STATUS,
    payload: {
        enablePerClassColoration: boolean;
    }
}

interface UpdateENV {
    type: typeof Action.UPDATE_ENV,
    payload: {
        env: Object;
    }
}

interface AddPopupMesssage {
    type: typeof Action.ADD_POPUP_MESSAGE,
    payload: {
        message: Object;
    }
}

interface UpdateHREF {
    type: typeof Action.UPDATE_HREF,
    payload: {
        href: string;
    }
}

export type GeneralActionTypes = UpdateProjectData
    | UpdateWindowSize
    | UpdateActivePopupType
    | UpdateCustomCursorStyle
    | UpdateActiveContext
    | UpdatePreventCustomCursorStatus
    | UpdateImageDragModeStatus
    | UpdateCrossHairVisibleStatus
    | updateReverseLineColor
    | UpdateZoom
    | UpdatePerClassColoration
    | UpdateENV
    | AddPopupMesssage
    | UpdateHREF
