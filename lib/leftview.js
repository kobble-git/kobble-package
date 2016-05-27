'use babel';

import {PanelView} from './views.js';
import React from 'react';
let {Component, PropTypes} = React;

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
      <div className="home-layout-container">
        Left View
      </div>
    );
  }
}

let view = new PanelView("Left", "left-panel-view", LeftComponent);
view.show();
