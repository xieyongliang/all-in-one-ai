
import { rootReducer } from './store';
import thunk from "redux-thunk" 
import { createStore, applyMiddleware, compose } from 'redux';

const storeEnhancers = compose

export default function configureStore() {
    return createStore(
        rootReducer,
        storeEnhancers(applyMiddleware(thunk))
    );
}