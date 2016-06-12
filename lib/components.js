'use babel';

import $ from 'jquery';
import env from './env';
import path from 'path';
import React from 'react';
let {Component, PropTypes} = React;
import _ from 'underscore-plus';
import {FlowCardJsx} from './jsx.js';
import {refreshProjects, atomOpen} from './leftview.js';
import {exists, createDir, saveFile} from './utils';
import {homeDir,kobbleDir,kobbleProjectsDir} from './env';

export class FlowCard extends Component {
  constructor(props) {
    super(props);
    this.state = props.card;
    this.state.buttonText = "Try It";
    this.state.action = (state) => {
      state.expanded = true;
      state.buttonText = "Install";
      return async (state) => await this.installFlow(state);
    }
  }

  showFlowInTreeview(flow) {
    //let escapedPath = flow.dir.replace(/\\/g, '\\\\');
    //let sel = "span[data-path='"+escapedPath+"']";
    //console.log("selector: " + sel);
    //let fele = $(sel).parent().parent().removeClass('collapsed').addClass('expanded');
    //console.log("open element", fele.length);
  }

  async openFlow(flow) {
    console.log("open flow", flow);
    atomOpen(flow.fullpath);
    return async (state) => await this.openFlow(state);
  }

  async fetchFlow(flow) {
    return '{}';
  }

  async copyFlow(flow, dir, name) {
    let flowdata = await this.fetchFlow(flow);
    flow.fullpath = path.join(dir, name + ".kob");
    await saveFile(flow.fullpath, flowdata);
  }

  async installFlow(flow) {
    try {
      console.log("installFlow", flow);
      flow.projectErrorText = "";
      flow.filenameErrorText = "";
      if (!flow.project || !flow.filename) {
        flow.projectErrorText = flow.project ? "" : "Project is required";
        flow.filenameErrorText = flow.filename ? "" : "Flow name is required";
      } else {
        flow.dir = path.join(kobbleProjectsDir, flow.project);
        if (!await exists(flow.dir)) {
          await createDir(flow.dir);
          this.addProject(flow.project, flow.dir);
        }
        flow.expanded = false;
        await this.copyFlow(flow, flow.dir, flow.filename);
        flow.buttonText = "Open";
        console.log("transition to open")
        refreshProjects(flow.project);
        return async (state) => await this.openFlow(state);
      }
    } catch (e) {
      console.log("installFlow error:", flow, e);
      flow.projectErrorText = "Error creating project: " + e;
    }
    return async (state) => await this.installFlow(state);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  handleProjectChange = (event) => {
    let nstate = _.extend({}, this.state, {"project" : event.target.value});
    this.setState(nstate);
  };

  handleFilenameChange = (event) => {
    let nstate = _.extend({}, this.state, {"filename" : event.target.value});
    this.setState(nstate);
  };

  render() {
    return FlowCardJsx(this, this.state);
  }
}
