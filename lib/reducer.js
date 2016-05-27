'use babel';

import {Map as iMap} from 'immutable';

let reducers = new Map();
let stateKeyMap = new Map();

export function addReducer(key, reducer, stateKey) {
  if (!stateKey) stateKey = key;
  stateKeyMap.set(key, stateKey);
  reducers.set(key, reducer);
}

export function removeReducer(key) {
  reducers.delete(key);
}

export function KobbleReducer(state = iMap({}), action) {
  for (let [key,reducer] of reducers.entries()) {
    let stateKey = stateKeyMap.get(key);
    //console.log("reducing: " + key + " stateKey: " + stateKey);
    let currentState = state.get(stateKey, iMap({}));
    state = state.set(stateKey, reducer(currentState, action));
    //console.log(state);
  }
  return state;
}
