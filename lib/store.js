'use babel';

import {Map} from 'immutable';
import {graphql} from './graphql';
import {KobbleReducer} from './reducer';
import { combineReducers, createStore, applyMiddleware } from 'redux';

export function newStore(client) {
  return createStore(
    combineReducers({
      kobble: KobbleReducer,
      apollo: graphql.apolloClient.reducer(),
    }),
    applyMiddleware(graphql.apolloClient.middleware())
  );
}
