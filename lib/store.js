'use babel';

import {Map} from 'immutable';
import {KobbleReducer} from './reducer';
import { combineReducers, createStore, applyMiddleware } from 'redux';

export function newStore(client) {
  return createStore(
    combineReducers({
      kobble: KobbleReducer,
      apollo: client.reducer(),
    }),
    applyMiddleware(client.middleware())
  );
}
