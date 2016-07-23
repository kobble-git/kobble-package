'use babel';

import fs from 'fs';
import path from 'path';
import shell from 'shell'
import React from 'react';
import {listDirectories, listFiles} from './utils.js';
import {PanelView} from './views.js';
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
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import ClearIcon from 'material-ui/svg-icons/content/clear';

function showHome() {
  atom.workspace.open("Home.kob-home");
}

function showFlows() {
  atom.workspace.open("Pipelines.kob-flows");
}

function showAccount() {
  atom.workspace.open("Account.kob-account");
}

function showDiscuss() {
  shell.openExternal('https://groups.google.com/forum/#!forum/kobble');
}

export function atomOpen(uri) {
  atom.workspace.open(uri);
  // TODO select uri in tree
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

let FileTypes = new Set([".kob"]);

async function getProjects() {
  let projects = _.map(listDirectories(kobbleProjectsDir), projectDir => {
    return {
      name: path.basename(projectDir),
      files: _.filter(listFiles(path.join(kobbleProjectsDir, projectDir)), file => FileTypes.has(path.extname(file)))
    }
  });
  return fromJS(projects);
}

const Projects = "Projects";
const ProjectsError = "ProjectsError";
const FetchProjects = "FetchProjects";

addReducer(Projects, (state, action) => {
  switch (action.type) {
    case Projects: {
      return state.set(Projects, action.projects);
    }
    default:
      return state;
  }
});

function* fetchProjects(action) {
   try {
      const projects = yield call(getProjects);
      console.log("projects:" + projects);
      yield put({type: Projects, projects});
   } catch (e) {
      yield put({type: ProjectsError, message: e.message});
   }
}

function* projectsSaga() {
  yield* takeEvery(FetchProjects, fetchProjects);
}

runSaga(projectsSaga);
export function refreshProjects(selected) {
  console.log("refreshProjects", selected);
  kobbleStore.dispatch({type:FetchProjects})
}
refreshProjects();

class LeftComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    let projects = state.kobble.get(Projects);
    return {
      state,
      projects: projects ? (projects.get(Projects) ? projects.get(Projects) : fromJS([])) : fromJS([])
    };
  }

  render() {
    return (
      <div className="left-container">
        <List>
          <Subheader style={subStyles}>Kobble</Subheader>
          <ListItem onClick={() => showAccount()} primaryText="Account" leftIcon={<AccountIcon style={iconStyles}/>} />
          <ListItem onClick={() => showHome()} primaryText="Home" leftIcon={<HomeIcon style={iconStyles}/>} />
          <ListItem onClick={() => showFlows()} primaryText="Pipelines" leftIcon={<FlowsIcon style={iconStyles} />} />
          <ListItem onClick={() => showDiscuss()} primaryText="Discuss" leftIcon={<DocIcon style={iconStyles}/>} />
        </List>
        <Divider/>
      </div>
    );
  }
}

let view = new PanelView("Left", "left-panel-view", LeftComponent, "left-base-element");
view.show();
