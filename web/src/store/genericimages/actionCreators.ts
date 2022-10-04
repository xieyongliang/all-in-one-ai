import { GenericsActionTypes, GenericImageData } from './types';
import { Action } from '../Actions';

export function updateActiveRankImageIndex(activeImageIndex: number): GenericsActionTypes {
    return {
        type: Action.UPDATE_RANK_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
        },
    };
}

export function updateGenericImageDataById(id: string, newImageData: GenericImageData): GenericsActionTypes {
    return {
        type: Action.UPDATE_RANK_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageData
        },
    };
}

export function addGenericImageData(imageData: GenericImageData[]): GenericsActionTypes {
    return {
        type: Action.ADD_RANK_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateGenericImageData(imagesData: GenericImageData[]): GenericsActionTypes {
    return {
        type: Action.UPDATE_RANK_IMAGES_DATA,
        payload: {
            imagesData,
        },
    };
}