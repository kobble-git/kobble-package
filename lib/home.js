'use babel';

import path from 'path';
import {openers, Opener, ComponentOpener} from './openers';
import {React, ReactDOM} from 'react-for-atom';
let {Component, PropTypes} = React;

class HomeComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    return {state};
  }

  static mapDispatchToProps(dispatch) {
    return {
    }
  }

  render() {
    return (<center>Home</center>);
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
