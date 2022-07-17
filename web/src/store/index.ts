import { combineReducers } from 'redux';
import { labelsReducer } from './labels/reducer';
import { generalReducer } from './general/reducer';
import { aiReducer } from './ai/reducer';
import { notificationsReducer } from './notifications/reducer';
import { pipelineReducer } from './pipelines/reducer';
import { industrialModelReducer } from './industrialmodels/reducer';
import { textsReducer } from './texts/reducer';
import sessionReduer  from './session/reducer'

export const rootReducer = combineReducers({
    general: generalReducer,
    labels: labelsReducer,
    texts: textsReducer,
    ai: aiReducer,
    notifications: notificationsReducer,
    pipeline: pipelineReducer,
    industrialmodel: industrialModelReducer,
    session: sessionReduer
});

export type AppState = ReturnType<typeof rootReducer>;
