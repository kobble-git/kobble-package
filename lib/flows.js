'use babel';

import env from './env';
import path from 'path';
import {Promise} from 'es6-promise';
import {homeDir,kobbleDir} from './env';

import {runSaga, kobbleStore} from './store';
import _ from 'underscore-plus';
import {addReducer} from './reducer';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGridLayout from 'react-grid-layout';
let {Component, PropTypes} = React;
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);
import {openers, Opener, ComponentOpener} from './openers';
import {noderedGetNodes, noderedGetFlows} from './noderedinfo';

import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

let cardTextStyle = { height:"175px", overflow:"auto"};
let cardActionsStyle = { position:"absolute", bottom:0};
const FlowCard = ({card}) => (
  <Card>
    <CardTitle subtitle={card.title} subtitleColor="#00A31C" style={{padding:"8px",'background-color':'#333'}}/>
    <CardText style={{padding:"8px",'background-color':'#333'}}>
      {card.description}
    </CardText>
    <CardActions>
      <FlatButton label="Install" />
    </CardActions>
  </Card>);

let noderedNodes = [];
let noderedFlows = [];
async function getFlowCards() {
  console.log("get flow cards");
  noderedNodes = await noderedGetNodes();
  noderedFlows = await noderedGetFlows();
  let flows = _.take(noderedNodes, 10);
  console.log(flows);
  return _.map(noderedFlows, (flow) => { return {title:flow.title,description:flow.desc};});
}

addReducer("flow", (state, action) => {
  switch (action.type) {
    case "FLOW_CARDS":
      return state.set("flowCards", action.cards);
    default:
      return state;
  }
});

function* fetchFlowCards(action) {
   try {
      const cards = yield call(getFlowCards);
      yield put({type: "FLOW_CARDS", cards: cards});
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
    let flow = state.kobble.get("flow");
    return {
      state,
      cards: flow ? flow.get("flowCards") : []
    };
  }

  render() {
    return (
      <div className="home-layout-container">
            {_.map(this.props.cards, (card, i) => {
              return (<div className="home-card-container">
                <FlowCard card={card}/>
              </div>)
            })}
      </div>
    );
  }
}

openers.addOpener(".kob-flows", (ext, ele, uri) => new ComponentOpener(uri, ele, FlowComponent));