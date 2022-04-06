import { Action } from '../Actions';
import {IRect} from '../../interfaces/IRect';

export type TextState = {
    activeImageIndex: number;
    activeTextId: string;
    highlightedTextId: string;
    imagesData: ImageTextData[];
    texts: Text[];
}

export type Text = {
    name: string;
    id: string;
    color: string;
}

export type TextRect = {
    // GENERAL
    id: string;
    text: string;
    rect: IRect;
}

export type ImageTextData = {
    id: string;
    fileData: File;
    loadStatus: boolean;
    textRects: TextRect[];
}

interface UpdateActiveImageIndex {
    type: typeof Action.UPDATE_TEXT_ACTIVE_IMAGE_INDEX;
    payload: {
        activeImageIndex: number;
    }
}

interface UpdateImageTextDataById {
    type: typeof Action.UPDATE_TEXT_IMAGE_DATA_BY_ID;
    payload: {
        id: string;
        newImageData: ImageTextData;
    }
}

interface AddImageTextData {
    type: typeof Action.ADD_TEXT_IMAGES_DATA;
    payload: {
        imageData: ImageTextData[];
    }
}

interface UpdateImageTextData {
    type: typeof Action.UPDATE_TEXT_IMAGES_DATA;
    payload: {
        imageData: ImageTextData[];
    }
}

interface UpdateActiveTextId {
    type: typeof Action.UPDATE_TEXT_ACTIVE_TEXT_ID;
    payload: {
        activeTextId: string;
    }
}

interface UpdateHighlightedTextId {
    type: typeof Action.UPDATE_TEXT_HIGHLIGHTED_TEXT_ID;
    payload: {
        highlightedTextId: string;
    }
}
export type TextsActionTypes = UpdateActiveImageIndex |
    UpdateImageTextDataById |
    AddImageTextData        |
    UpdateImageTextData     |
    UpdateActiveTextId      |
    UpdateHighlightedTextId
