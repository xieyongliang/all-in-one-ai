import {RanksActionTypes, RankImageData } from './types';
import {Action} from '../Actions';

export function updateActiveRankImageIndex(activeImageIndex: number): RanksActionTypes {
    return {
        type: Action.UPDATE_RANK_ACTIVE_IMAGE_INDEX,
        payload: {
            activeImageIndex,
        },
    };
}

export function updateRankImageDataById(id: string, newImageData: RankImageData): RanksActionTypes {
    return {
        type: Action.UPDATE_RANK_IMAGE_DATA_BY_ID,
        payload: {
            id,
            newImageData
        },
    };
}

export function addRankImageData(imageData: RankImageData[]): RanksActionTypes {
    return {
        type: Action.ADD_RANK_IMAGES_DATA,
        payload: {
            imageData,
        },
    };
}

export function updateRankImageData(imagesData: RankImageData[]): RanksActionTypes {
    return {
        type: Action.UPDATE_RANK_IMAGES_DATA,
        payload: {
            imagesData,
        },
    };
}