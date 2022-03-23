import { Action } from '../Actions';
import { IIndustrialModel } from './reducer';
import { PipelineActionTypes } from './types';

export function Updateindustrialmodels(industrialModels: IIndustrialModel[]): PipelineActionTypes {
    return {
        type: Action.UPDATE_INDUSTRIAL_MODELS,
        payload: {
            industrialModels,
        },
    };
}
