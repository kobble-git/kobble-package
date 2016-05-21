'use babel';

import path from 'path';
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

import { takeEvery, takeLatest } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

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

async function getHomeCards() {
  return [
    {title:"Title 0", subtitle: "Subtitle 0", description: "Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0,Description 0"},
    {title:"Title 1", subtitle: "Subtitle 1", description: "Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1,Description 1"},
    {title:"Title 2", subtitle: "Subtitle 2", description: "Description 2"},
    {title:"Title 3", subtitle: "Subtitle 3", description: "Description 3"}
  ];
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
console.log(layouts);

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
      cols: {xxxlg: 11, xxlg: 10, xlg: 9, lg: 8, md: 7, sm: 6, xs: 5, xxs: 4},
      breakpoints: {xxxlg: 1650, xxlg: 1500, xlg: 1350, lg: 1200, md: 1050, sm: 900, xs: 750, xxs: 600},
      layouts: {xxxlg:layouts}
    };
  }

  render() {
    console.log(keys);
    return (
      <div className="home-layout-container">
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <ResponsiveReactGridLayout className="home-layout" breakpoints={this.props.breakpoints} cols={this.props.cols} layouts={this.props.layouts} rowHeight={this.props.rowHeight}>
            {_.map(this.props.cards, (card, i) => {
              return (<div className="home-card-container" key={keys[i]}>
                <HomeCard card={card}/>
              </div>)
            })}
          </ResponsiveReactGridLayout>
        </MuiThemeProvider>
      </div>
    );
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
