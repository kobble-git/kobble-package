'use babel';

import fs from 'fs';
import path from 'path';
import {PanelView} from './views.js';
import React from 'react';
import {List as iList, fromJS} from 'immutable';
let {Component, PropTypes} = React;
import {kobbleDir,kobbleProjectsDir} from './env';

import {runSaga, kobbleStore} from './store';
import {addReducer} from './reducer';
import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import IconButton from 'material-ui/IconButton';

import _ from 'underscore-plus';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import FlowsIcon from 'material-ui/svg-icons/action/timeline';
import HomeIcon from 'material-ui/svg-icons/action/home';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import DocIcon from 'material-ui/svg-icons/content/content-copy';
import RefreshIcon from 'material-ui/svg-icons/action/cached';
import OpenIcon from 'material-ui/svg-icons/action/open-in-new';
import ClearIcon from 'material-ui/svg-icons/content/clear';

function getDirectories(srcpath) {
  return fs.readdirSync(srcpath).filter(function(file) {
    return fs.statSync(path.join(srcpath, file)).isDirectory();
  });
}

function showHome() {
  atom.workspace.open("Home.kob-home");
}

function showFlows() {
  atom.workspace.open("Flows.kob-flows");
}

function clearIconClicked(ev, project) {
  console.log("clearIconClicked", project);
  ev.stopPropagation();
}

function deleteIconClicked(project) {
  console.log("deleteIconClicked", project);
}

function showProject(project) {
  console.log("showProject", project);
}

let subStyles = {
  'font-size':'16px',
  'line-height':'32px',
  'box-sizing':'border-box',
  'padding-top': '16px',
  'color': '#ccc'
};

let iconStyles = {
  fill:' #ccc'
}

let clearIcon = <ClearIcon style={iconStyles} />
let deleteIcon = <DeleteIcon style={iconStyles} />
let leftIcons = {
  "flow" : <FlowsIcon style={iconStyles} />
}

async function getQuickLinks() {
  let f = path.join(kobbleDir, "quick-links.json");
  let json = fs.readFileSync(f, "utf8");
  return fromJS(JSON.parse(json));
}

const QuickLinks = "QuickLinks";
const AddQuickLink = "AddQuickLink";
const QuickLinksError = "QuickLinkError";
const FetchQuickLinks = "FetchQuickLinks";

addReducer(QuickLinks, (state, action) => {
  switch (action.type) {
    case QuickLinks: {
      console.log("QuickLinks:" + action.quickLinks);
      return state.set(QuickLinks, action.quickLinks);
    }
    case AddQuickLink: {
      let quickLinks = state.get(QuickLinks);
      return state;
    }
    default:
      return state;
  }
});

function* fetchQuickLinks(action) {
   try {
      const quickLinks = yield call(getQuickLinks);
      console.log("quickLinks:" + quickLinks);
      yield put({type: QuickLinks, quickLinks});
   } catch (e) {
      yield put({type: QuickLinksError, message: e.message});
   }
}

function* quickLinksSaga() {
  yield* takeEvery(FetchQuickLinks, fetchQuickLinks);
}

runSaga(quickLinksSaga);
kobbleStore.dispatch({type:FetchQuickLinks})


class LeftComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    let quickLinks = state.kobble.get(QuickLinks);
    return {
      state,
      quickLinks: quickLinks ? (quickLinks.get(QuickLinks) ? quickLinks.get(QuickLinks) : fromJS([])) : fromJS([])
    };
  }

  render() {
    return (
      <div className="left-container">
        <List>
          <Subheader style={subStyles}>Kobble</Subheader>
          <ListItem onClick={() => showHome()} primaryText="Home" leftIcon={<HomeIcon style={iconStyles}/>} />
          <ListItem onClick={() => showFlows()} primaryText="Flows" leftIcon={<FlowsIcon style={iconStyles} />} rightIcon={<RefreshIcon style={iconStyles} />} />
          <ListItem onClick={() => showUserGuide()} primaryText="User Guide" leftIcon={<DocIcon style={iconStyles}/>} />
        </List>
        <Divider/>
        <List>
          <Subheader style={subStyles}>Quick Links</Subheader>
          {this.props.quickLinks.map((ql, i) => {
            return (
              <ListItem onClick={() => showProject(ql)} leftIcon={leftIcons[ql.get("type")]} primaryText={ql.get("name")} rightIconButton={<IconButton onClick={(ev) => clearIconClicked(ev, ql)}><ClearIcon style={iconStyles} /></IconButton>} />
            )
          })}
        </List>
        <Divider/>
      </div>
    );
  }
}

let view = new PanelView("Left", "left-panel-view", LeftComponent, "left-base-element");
view.show();
