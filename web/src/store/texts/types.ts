import { Action } from '../Actions';
import {IRect} from '../../interfaces/IRect';
import { IPoint } from '../../interfaces/IPoint';

export type TextState = {
    activeImageIndex: number;
    activeTextId: string;
    highlightedTextId: string;
    imagesData: TextImageData[];
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

export type TextPolygon = {
    id: string;
    text: string;
    vertices: IPoint[];
}

export type TextImageData = {
    id: string;
    fileData: File;
    loadStatus: boolean;
    textRects: TextRect[];
    textPolygons: TextPolygon[];
}

interface UpdateActiveImageIndex {
    type: typeof Action.UPDATE_TEXT_ACTIVE_IMAGE_INDEX;
    payload: {
        activeImageIndex: number;
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

interface UpdateTextImageDataById {
    type: typeof Action.UPDATE_TEXT_IMAGE_DATA_BY_ID;
    payload: {
        id: string;
        newImageData: TextImageData;
    }
}

interface AddTextImageData {
    type: typeof Action.ADD_TEXT_IMAGES_DATA;
    payload: {
        imageData: TextImageData[];
    }
}

interface UpdateTextImageData {
    type: typeof Action.UPDATE_TEXT_IMAGES_DATA;
    payload: {
        imageData: TextImageData[];
    }
}

interface UpdateTexts {
    type: typeof Action.UPDATE_TEXTS;
    payload: {
        texts: Text[];
    }
}

export type TextsActionTypes = UpdateActiveImageIndex |
    UpdateActiveTextId      |
    UpdateHighlightedTextId |
    UpdateTextImageDataById |
    AddTextImageData        |
    UpdateTextImageData     |
    UpdateTexts
