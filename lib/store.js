'use babel';

import {KobbleReducer} from './reducer';
import createSagaMiddleware from 'redux-saga'
import { combineReducers, createStore, applyMiddleware } from 'redux';

let sagaMiddleware = createSagaMiddleware();

export function newStore(client) {
  let middleware = [client.middleware(), sagaMiddleware];
  return createStore(
    combineReducers({
      kobble: KobbleReducer,
      apollo: client.reducer()
    }),
    applyMiddleware(...middleware)
  );
}

export function runSaga(saga) {
  sagaMiddleware.run(saga);
}
