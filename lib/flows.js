'use babel';

import env from './env';
import path from 'path';
import {Promise} from 'es6-promise';
import {homeDir,kobbleDir,kobbleProjectsDir} from './env';

import {runSaga, kobbleStore} from './store';
import _ from 'underscore-plus';
import {addReducer} from './reducer';
import React from 'react';
import ReactDOM from 'react-dom';
let {Component, PropTypes} = React;
import {openers, Opener, ComponentOpener} from './openers';

import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';

import {FlowComponentJsx} from './jsx.js';
import {listFiles, readJsonFile} from './utils.js';

async function getSampleFlows() {
  let pipelines = path.join(__dirname, "..", "pipelines", "samples.json");
  return readJsonFile(pipelines, []);
}

async function getFlowCards() {
  console.log("get sample pipelines");
  return await getSampleFlows();
}

addReducer("flows", (state, action) => {
  switch (action.type) {
    case "FLOW_CARDS":
      return state.set("flowCards", action.cards);
    case "FLOW_CARD_UPDATED":
      console.log("flow card updated");
      return state.set("changedCard", action.card);
    default:
      return state;
  }
});

function* fetchFlowCards(action) {
   try {
      const cards = yield call(getFlowCards);
      yield put({type: "FLOW_CARDS", cards});
   } catch (e) {
      yield put({type: "FLOW_CARDS_ERROR", message: e.message});
   }
}

function* flowCardsSaga() {
  yield* takeEvery("FETCH_FLOW_CARDS", fetchFlowCards);
}

// Kick start flow page
runSaga(flowCardsSaga);
kobbleStore.dispatch({type:"FETCH_FLOW_CARDS"})

class FlowComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    let flow = state.kobble.get("flows");
    return {
      state,
      cards: flow ? flow.get("flowCards") : []
    };
  }

  render() {
    return FlowComponentJsx(this, this.props.cards);
  }
}

openers.addOpener(".kob-flows", (ext, ele, uri) => new ComponentOpener(uri, ele, FlowComponent));
