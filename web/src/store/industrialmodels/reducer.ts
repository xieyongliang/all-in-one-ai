import { IndustrialModelActionTypes, IndustrialModelState } from './types';
import { Action } from '../Actions';

export interface IIndustrialModel {
    id: string,
    name: string,
    algorithm: string,
    icon: string,
    samples: string,
    description: string,
    extra: string
}

const initialState: IndustrialModelState = {
    industrialModels: []
};

export function industrialModelReducer(
    state = initialState,
    action: IndustrialModelActionTypes
): IndustrialModelState {
    switch (action.type) {
        case Action.UPDATE_INDUSTRIAL_MODELS: {
            return {
                ...state,
                industrialModels: action.payload.industrialModels
            }
        }
        default:
            return state;
    }
}
