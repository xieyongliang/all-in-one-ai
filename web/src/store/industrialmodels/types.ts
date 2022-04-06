import { Action } from '../Actions';
import { IIndustrialModel } from './reducer';

export type IndustrialModelState = {
    industrialModels: IIndustrialModel[]
}

interface Updateindustrialmodels {
    type: typeof Action.UPDATE_INDUSTRIAL_MODELS;
    payload: {
        industrialModels: IIndustrialModel[];
    }
}

export type IndustrialModelActionTypes = Updateindustrialmodels
