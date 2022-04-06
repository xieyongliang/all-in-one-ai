import { Action } from '../Actions';
import { IIndustrialModel } from './reducer';
import { IndustrialModelActionTypes } from './types';

export function Updateindustrialmodels(industrialModels: IIndustrialModel[]): IndustrialModelActionTypes {
    return {
        type: Action.UPDATE_INDUSTRIAL_MODELS,
        payload: {
            industrialModels,
        },
    };
}
