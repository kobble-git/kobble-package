'use babel';

import {PanelView} from './views.js';
import React from 'react';
let {Component, PropTypes} = React;

import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import {List, ListItem} from 'material-ui/List';
import FlowsIcon from 'material-ui/svg-icons/action/timeline';
import HomeIcon from 'material-ui/svg-icons/action/home';
import NodesIcon from 'material-ui/svg-icons/device/widgets';
import DocIcon from 'material-ui/svg-icons/content/content-copy';
import RefreshIcon from 'material-ui/svg-icons/action/cached';

function showHome() {
  atom.workspace.open("Home.kob-home");
}

function showFlows() {
  atom.workspace.open("Flows.kob-flows");
}

function showUserGuide() {
  console.log("show user guide");
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

class LeftComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
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
      </div>
    );
  }
}

let view = new PanelView("Left", "left-panel-view", LeftComponent, "left-base-element");
view.show();
