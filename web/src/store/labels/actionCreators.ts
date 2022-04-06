import {LabelsActionTypes, ImageLabelData, LabelName} from './types';
import {Action} from '../Actions';
import {LabelType} from '../../data/enums/LabelType';

export function updateActiveLabelImageIndex(activeImageIndex: number): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
        },
    };
}

export function updateActiveLabelNameId(activeLabelNameId: string): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_ACTIVE_LABEL_NAME_ID,
        payload: {
            activeLabelNameId,
        },
    };
}

export function updateActiveLabelId(activeLabelId: string): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_ACTIVE_LABEL_ID,
        payload: {
            activeLabelId,
        },
    };
}

export function updateHighlightedLabelId(highlightedLabelId: string): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_HIGHLIGHTED_LABEL_ID,
        payload: {
            highlightedLabelId,
        },
    };
}

export function updateActiveLabelType(activeLabelType: LabelType): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_ACTIVE_LABEL_TYPE,
        payload: {
            activeLabelType,
        },
    };
}

export function updateImageLabelDataById(id: string, newImageLabelData: ImageLabelData): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageLabelData
        },
    };
}

export function addImageLabelData(imageData: ImageLabelData[]): LabelsActionTypes {
    return {
        type: Action.ADD_LABEL_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateImageLabelData(imageData: ImageLabelData[]): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateLabelNames(labels: LabelName[]): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_NAMES,
        payload: {
            labels
        }
    }
}

export function updateFirstLabelCreatedFlag(firstLabelCreatedFlag: boolean): LabelsActionTypes {
    return {
        type: Action.UPDATE_LABEL_FIRST_LABEL_CREATED_FLAG,
        payload: {
            firstLabelCreatedFlag
        }
    }
}
