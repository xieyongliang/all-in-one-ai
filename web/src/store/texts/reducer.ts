import { TextsActionTypes, TextState, ImageTextData } from './types';
import { Action } from '../Actions';

const initialState: TextState = {
    activeImageIndex: null,
    activeTextId : null,
    highlightedTextId: null, 
    imagesData: [],
    texts: [],
};

export function textsReducer(
    state = initialState,
    action: TextsActionTypes
): TextState {
    switch (action.type) {
        case Action.UPDATE_TEXT_ACTIVE_IMAGE_INDEX: {
            return {
                ...state,
                activeImageIndex: action.payload.activeImageIndex
            }
        }
        case Action.UPDATE_TEXT_ACTIVE_TEXT_ID: {
            return {
                ...state,
                activeTextId: action.payload.activeTextId
            }
        }
        case Action.UPDATE_TEXT_HIGHLIGHTED_TEXT_ID: {
            return {
                ...state,
                highlightedTextId: action.payload.highlightedTextId
            }
        }
        case Action.UPDATE_TEXT_IMAGE_DATA_BY_ID: {
            return {
                ...state,
                imagesData: state.imagesData.map((imageData: ImageTextData) =>
                    imageData.id === action.payload.id ? action.payload.newImageData : imageData
                )
            }
        }
        case Action.ADD_TEXT_IMAGES_DATA: {    
            return {
                ...state,
                imagesData: state.imagesData.concat(action.payload.imageData)
            }
        }
        case Action.UPDATE_TEXT_IMAGES_DATA: {
            return {
                ...state,
                imagesData: action.payload.imageData
            }
        }
        case Action.UPDATE_TEXTS: {
            return {
                ...state,
                texts: action.payload.texts
            }
        }
        default:
            return state;
    }
}