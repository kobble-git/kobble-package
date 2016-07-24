'use babel';

import env from './env';
import path from 'path';
import shell from 'shell'
import {Promise} from 'es6-promise';
import {homeDir,kobbleDir} from './env';

import {runSaga, kobbleStore} from './store';
import _ from 'underscore-plus';
import {addReducer} from './reducer';
import React from 'react';
import ReactDOM from 'react-dom';
let {Component, PropTypes} = React;
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

import AppBar from 'material-ui/AppBar';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

async function getHomeCards() {
  console.log("get home cards");
  return [{title:"Kobble title","description":"Kobble Description"}];
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
      cards: home ? home.get("homeCards") : []
    };
  }

  purchase() {
    shell.openExternal('https://kobble.io');
  }

  pipelines() {
    atom.workspace.open("Pipelines.kob-flows");
  }

  render() {
    let buttonStyle = {
      color: 'white',
      marginLeft: "5px",
      marginRight: "5px"
    };
    let toolbarStyle = {
      "background-color": "#222"
    }
    let homeShot = path.join(__dirname, "..", "images", "home-shot.png");
    console.log("homeShot: " + homeShot);

    let aAtom = <a href="http://atom.io">Atom</a>;
    let aNodejs = <a href="http://nodejs.org">Node.js</a>;
    let aNodered = <a href="http://nodered.org">Node-RED</a>;

    return (
      <div className="home-layout-container">
        <Toolbar style={toolbarStyle}>
          <ToolbarGroup float="left">
            <RaisedButton label="Pipelines" style={buttonStyle} onClick={this.pipelines}/>
            <RaisedButton label="Discuss" style={buttonStyle} onClick={this.discuss}/>
          </ToolbarGroup>
          <ToolbarGroup float="left">
            <RaisedButton label="Purchase" style={buttonStyle} onClick={this.purchase} />
          </ToolbarGroup>
        </Toolbar>
        <div>
          <div className="home-section">
            <div className="home-title">Kobble</div>
            <div className="home-subtitle">Pipelines to Enhance and Automate Your Computing Life</div>
            <div className="home-image">
              <img src={homeShot} />
            </div>
            <div className="home-description">
              <p>Kobble Pipelines is a graphical pipeline editor that can
              be used for many kinds of application, such as automating basic tasks, building data mashups, and IOT applications.</p>
            </div>
          </div>
          <div className="home-section">
            <div className="home-title">Built with {aNodered}</div>
            <div className="home-description">
              <p>Kobble Pipelines uses {aNodered} as
              the pipeline engine and ships with dozens of {aNodered} nodes preinstalled. And, you can easily add any {aNodered}
              node not included with Kobble Pipelines.</p>
              <p>Kobble Pipelines adds significant features to {aNodered}. Most notably, it allows you to start
              any number of pipelines by simply clicking the pipeline in the Atom project treeview.</p>
              <p>Pipelines starts a separate {aNodered} background process, and connects the process
              to a web view running in a tab in {aAtom}.</p>
            </div>
          </div>
          <div className="home-section">
            <div className="home-title">{aNodejs} Embedded</div>
            <div className="home-description">
              <p>Kobble Pipelines is built with {aAtom}, and runs as an {aAtom} package. Hence, you can use {aAtom}
              to build additional nodes and to manage your projects.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
