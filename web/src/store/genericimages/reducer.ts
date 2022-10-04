import { GenericsActionTypes, GenericImageState, GenericImageData } from './types';
import { Action } from '../Actions';

const initialState: GenericImageState = {
    activeImageIndex: null,
    imagesData: []
};

export function genericImageReducer(
    state = initialState,
    action: GenericsActionTypes
): GenericImageState {
    switch (action.type) {
        case Action.UPDATE_RANK_ACTIVE_IMAGE_INDEX: {
            return {
                ...state,
                activeImageIndex: action.payload.activeImageIndex
            }
        }
        case Action.UPDATE_RANK_IMAGE_DATA_BY_ID: {
            return {
                ...state,
                imagesData: state.imagesData.map((imageData: GenericImageData) =>
                    imageData.id === action.payload.id ? action.payload.newImageData : imageData
                )
            }
        }
        case Action.ADD_RANK_IMAGES_DATA: {
            return {
                ...state,
                imagesData: state.imagesData.concat(action.payload.imageData)
            }
        }
        case Action.UPDATE_RANK_IMAGES_DATA: {
            return {
                ...state,
                imagesData: action.payload.imagesData
            }
        }
        default:
            return state;
    }
}
