'use babel';

import {Map as iMap} from 'immutable';

let reducers = new Map();

export function addReducer(key,reducer) {
  reducers.set(key, reducer);
}

export function removeReducer(key) {
  reducers.delete(key);
}

export function KobbleReducer(state = iMap({}), action) {
  for (let [key,reducer] of reducers.entries())
    state.set(key, reducer(state.get(key, iMap({})), action));
  return state;
}
