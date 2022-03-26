import { PipelineActionTypes, IndustrialModelState } from './types';
import { Action } from '../Actions';

export interface IIndustrialModel {
    id: string,
    name: string,
    algorithm: string,
    icon: string,
    samples: string,
    description: string,
    labels: string[]
}

const initialState: IndustrialModelState = {
    industrialModels: []
};

export function industrialModelReducer(
    state = initialState,
    action: PipelineActionTypes
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
