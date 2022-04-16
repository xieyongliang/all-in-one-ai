import {TextsActionTypes, TextImageData, Text } from './types';
import { Action } from '../Actions';

export function updateActiveTextImageIndex(activeImageIndex: number): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
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

export function updateTextImageDataById(id: string, newImageData: TextImageData): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageData
        },
    };
}

export function addTextImageData(imageData: TextImageData[]): TextsActionTypes {
    return {
        type: Action.ADD_TEXT_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateTextImageData(imageData: TextImageData[]): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXT_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateTexts(texts: Text[]): TextsActionTypes {
    return {
        type: Action.UPDATE_TEXTS,
        payload: {
            texts,
        },
    };
}
