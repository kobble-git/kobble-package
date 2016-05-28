'use babel';

import env from './env';
import atom from 'atom';
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
const HomeCard = ({card}) => (
  <Card>
    <CardTitle title={card.title} subtitle={card.subtitle} />
    <CardText style={cardTextStyle}>
      {card.description}
    </CardText>
    <CardActions style={cardActionsStyle}>
      <FlatButton label="Install" />
    </CardActions>
  </Card>);

let noderedNodes = [];
let noderedFlows = [];
async function getHomeCards() {
  console.log("get home cards");
  noderedNodes = await noderedGetNodes();
  noderedFlows = await noderedGetFlows();
  let flows = _.take(noderedFlows, 10);
  console.log(flows);
  return _.map(flows, (flow) => { return {title:flow.title,description:flow.desc};});
  //return [
  //  {title:"Title 0", subtitle: "Subtitle 0", description: "Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0"},
  //  {title:"Title 1", subtitle: "Subtitle 1", description: "Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1"},
  //  {title:"Title 2", subtitle: "Subtitle 2", description: "Description 2"},
  //  {title:"Title 3", subtitle: "Subtitle 3", description: "Description 3"}
  //];
}

addReducer("home", (state, action) => {
  switch (action.type) {
    case "HOME_CARDS":
      return state.set("homeCards", action.cards);
    default:
      return state;
  }
});

function* fetchHomeCards(action) {
   try {
      const cards = yield call(getHomeCards);
      yield put({type: "HOME_CARDS", cards: cards});
   } catch (e) {
      yield put({type: "HOME_CARDS_ERROR", message: e.message});
   }
}

function* homeCardsSaga() {
  yield* takeEvery("FETCH_HOME_CARDS", fetchHomeCards);
}

// Kick start home page
runSaga(homeCardsSaga);
kobbleStore.dispatch({type:"FETCH_HOME_CARDS"})

let keys = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let layouts = _.map(keys, function(key, i) {
  return {i: key, x: i*2, y: 0, w: 2, h: 2, isResizable: false}
});

class HomeComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    let home = state.kobble.get("home");
    return {
      state,
      rowHeight: 150,
      cards: home ? home.get("homeCards") : [],
      cols: {xxxlg: 12, xxlg: 11, xlg: 10, lg: 9, md: 8, sm: 7, xs: 6},
      breakpoints: {xxxlg: 1800, xxlg: 1650, xlg: 1500, lg: 1350, md: 1200, sm: 1050, xs: 900},
      layouts: {xxxlg:layouts}
    };
  }

  render() {
    return (
      <div className="home-layout-container">
          <ResponsiveReactGridLayout className="home-layout" breakpoints={this.props.breakpoints} cols={this.props.cols} layouts={this.props.layouts} rowHeight={this.props.rowHeight}>
            {_.map(this.props.cards, (card, i) => {
              return (<div className="home-card-container" key={keys[i]}>
                <HomeCard card={card}/>
              </div>)
            })}
          </ResponsiveReactGridLayout>
      </div>
    );
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
