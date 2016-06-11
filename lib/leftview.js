'use babel';

import fs from 'fs';
import path from 'path';
import React from 'react';
import {readFile} from './utils.js';
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

async function getProjects() {
  let f = path.join(kobbleDir, "projects.json");
  let json = await readFile(f, "[]");
  console.log("projects", json)
  return fromJS(JSON.parse(json));
}

const Projects = "QuickLinks";
const AddProject = "AddQuickLink";
const ProjectsError = "QuickLinkError";
const FetchProjects = "FetchQuickLinks";

addReducer(Projects, (state, action) => {
  switch (action.type) {
    case Projects: {
      return state.set(Projects, action.projects);
    }
    case AddProject: {
      let projects = state.get(Projects);
      return state;
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
kobbleStore.dispatch({type:FetchProjects})


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
          <ListItem onClick={() => showHome()} primaryText="Home" leftIcon={<HomeIcon style={iconStyles}/>} />
          <ListItem onClick={() => showFlows()} primaryText="Flows" leftIcon={<FlowsIcon style={iconStyles} />} rightIcon={<RefreshIcon style={iconStyles} />} />
          <ListItem onClick={() => showUserGuide()} primaryText="User Guide" leftIcon={<DocIcon style={iconStyles}/>} />
        </List>
        <Divider/>
        <List>
          <Subheader style={subStyles}>Projects</Subheader>
          {this.props.projects.map((p, i) => {
            return (
              <ListItem onClick={() => showProject(ql)} leftIcon={leftIcons[p.get("type")]} primaryText={p.get("name")} rightIconButton={<IconButton onClick={(ev) => clearIconClicked(ev, p)}><ClearIcon style={iconStyles} /></IconButton>} />
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
