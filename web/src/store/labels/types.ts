import {IRect} from '../../interfaces/IRect';
import {Action} from '../Actions';
import {LabelType} from '../../data/enums/LabelType';
import {IPoint} from '../../interfaces/IPoint';
import {LabelStatus} from '../../data/enums/LabelStatus';
import {ILine} from '../../interfaces/ILine';

export type LabelRect = {
    // GENERAL
    id: string;
    labelId: string;
    rect: IRect;

    // AI
    isCreatedByAI: boolean;
    status: LabelStatus;
    suggestedLabel: string;
}

export type LabelPoint = {
    // GENERAL
    id: string;
    labelId: string;
    point: IPoint;

    // AI
    isCreatedByAI: boolean;
    status: LabelStatus;
    suggestedLabel: string;
}

export type LabelPolygon = {
    id: string;
    labelId: string;
    vertices: IPoint[];
}

export type LabelLine = {
    id: string;
    labelId: string;
    line: ILine
}

export type LabelName = {
    name: string;
    id: string;
    color: string;
}

export type LabelImageData = {
    id: string;
    fileData: File;
    loadStatus: boolean;
    labelRects: LabelRect[];
    labelPoints: LabelPoint[];
    labelLines: LabelLine[];
    labelPolygons: LabelPolygon[];
    labelNameIds: string[];

    // SSD
    isVisitedByObjectDetector: boolean;

    // POSE NET
    isVisitedByPoseDetector: boolean;
}

export type LabelsState = {
    activeImageIndex: number;
    activeLabelNameId: string;
    activeLabelType: LabelType;
    activeLabelId: string;
    highlightedLabelId: string;
    imagesData: LabelImageData[];
    firstLabelCreatedFlag: boolean;
    labels: LabelName[];
}

export type TextsState = {
    activeTextId: string;
}

interface UpdateActiveImageIndex {
    type: typeof Action.UPDATE_LABEL_ACTIVE_IMAGE_INDEX;
    payload: {
        activeImageIndex: number;
    }
}

interface UpdateActiveLabelNameId {
    type: typeof Action.UPDATE_LABEL_ACTIVE_LABEL_NAME_ID;
    payload: {
        activeLabelNameId: string;
    }
}

interface UpdateActiveLabelId {
    type: typeof Action.UPDATE_LABEL_ACTIVE_LABEL_ID;
    payload: {
        activeLabelId: string;
    }
}

interface UpdateHighlightedLabelId {
    type: typeof Action.UPDATE_LABEL_HIGHLIGHTED_LABEL_ID;
    payload: {
        highlightedLabelId: string;
    }
}

interface UpdateActiveLabelType {
    type: typeof Action.UPDATE_LABEL_ACTIVE_LABEL_TYPE;
    payload: {
        activeLabelType: LabelType;
    }
}

interface UpdateLabelImageDataById {
    type: typeof Action.UPDATE_LABEL_IMAGE_DATA_BY_ID;
    payload: {
        id: string;
        newImageData: LabelImageData;
    }
}

interface AddLabelImageData {
    type: typeof Action.ADD_LABEL_IMAGES_DATA;
    payload: {
        imageData: LabelImageData[];
    }
}

interface UpdateLabelImageData {
    type: typeof Action.UPDATE_LABEL_IMAGES_DATA;
    payload: {
        imagesData: LabelImageData[];
    }
}

interface UpdateLabelNames {
    type: typeof Action.UPDATE_LABEL_NAMES;
    payload: {
        labels: LabelName[];
    }
}

interface UpdateFirstLabelCreatedFlag {
    type: typeof Action.UPDATE_LABEL_FIRST_LABEL_CREATED_FLAG;
    payload: {
        firstLabelCreatedFlag: boolean;
    }
}

export type LabelsActionTypes = UpdateActiveImageIndex
    | UpdateActiveLabelNameId
    | UpdateActiveLabelType
    | UpdateLabelImageDataById
    | AddLabelImageData
    | UpdateLabelImageData
    | UpdateLabelNames
    | UpdateActiveLabelId
    | UpdateHighlightedLabelId
    | UpdateFirstLabelCreatedFlag

