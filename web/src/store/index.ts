import { combineReducers } from 'redux';
import {labelsReducer} from './labels/reducer';
import {generalReducer} from './general/reducer';
import {aiReducer} from './ai/reducer';
import {notificationsReducer} from './notifications/reducer';
import { pipelineReducer } from './pipelines/reducer';
import { industrialModelReducer } from './industrialmodels/reducer';

export const rootReducer = combineReducers({
    general: generalReducer,
    labels: labelsReducer,
    ai: aiReducer,
    notifications: notificationsReducer,
    pipeline: pipelineReducer,
    industrialmodel: industrialModelReducer,
});

export type AppState = ReturnType<typeof rootReducer>;
