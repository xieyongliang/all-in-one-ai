import {Action} from '../Actions';

export type RankImageData = {
    id: string;
    fileData: File;
    loadStatus: boolean;
    rank: string;
}

export type RanksState = {
    activeImageIndex: number;
    imagesData: RankImageData[];
}

interface UpdateActiveImageIndex {
    type: typeof Action.UPDATE_RANK_ACTIVE_IMAGE_INDEX;
    payload: {
        activeImageIndex: number;
    }
}

interface UpdateRankImageDataById {
    type: typeof Action.UPDATE_RANK_IMAGE_DATA_BY_ID;
    payload: {
        id: string;
        newImageData: RankImageData;
    }
}

interface AddRankImageData {
    type: typeof Action.ADD_RANK_IMAGES_DATA;
    payload: {
        imageData: RankImageData[];
    }
}

interface UpdateRankImageData {
    type: typeof Action.UPDATE_RANK_IMAGES_DATA;
    payload: {
        imagesData: RankImageData[];
    }
}

export type RanksActionTypes = UpdateActiveImageIndex
    | UpdateRankImageDataById
    | AddRankImageData
    | UpdateRankImageData


