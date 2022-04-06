import {TextsActionTypes, ImageTextData} from './types';
import { Action } from '../Actions';

export function updateActiveTextImageIndex(activeImageIndex: number): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
        },
    };
}

export function updateImageTextDataById(id: string, newImageData: ImageTextData): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageData
        },
    };
}

export function addImageTextData(imageData: ImageTextData[]): TextsActionTypes {
    return {
        type: Action.ADD_TEXT_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateImageTextData(imageData: ImageTextData[]): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateActiveTextId(activeTextId: string): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_ACTIVE_TEXT_ID,
        payload: {
            activeTextId,
        },
    };
}

export function updateHighlightedTextId(highlightedTextId: string): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_HIGHLIGHTED_TEXT_ID,
        payload: {
            highlightedTextId,
        },
    };
}

