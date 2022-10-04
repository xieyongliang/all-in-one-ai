import { Action } from '../Actions';

export type GenericImageData = {
    id: string;
    fileData: File;
    loadStatus: boolean;
    value: string;
}

export type GenericImageState = {
    activeImageIndex: number;
    imagesData: GenericImageData[];
}

interface UpdateActiveImageIndex {
    type: typeof Action.UPDATE_RANK_ACTIVE_IMAGE_INDEX;
    payload: {
        activeImageIndex: number;
    }
}

interface UpdateGenericImageDataById {
    type: typeof Action.UPDATE_RANK_IMAGE_DATA_BY_ID;
    payload: {
        id: string;
        newImageData: GenericImageData;
    }
}

interface AddGenericImageData {
    type: typeof Action.ADD_RANK_IMAGES_DATA;
    payload: {
        imageData: GenericImageData[];
    }
}

interface UpdateGenericImageData {
    type: typeof Action.UPDATE_RANK_IMAGES_DATA;
    payload: {
        imagesData: GenericImageData[];
    }
}

export type GenericsActionTypes = UpdateActiveImageIndex
    | UpdateGenericImageDataById
    | AddGenericImageData
    | UpdateGenericImageData


