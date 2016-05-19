'use babel';

import path from 'path';
import {openers, Opener, ComponentOpener} from './openers';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactGridLayout from 'react-grid-layout';
let {Component, PropTypes} = React;
import {Responsive, WidthProvider} from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import { takeEvery, takeLatest } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const MyAwesomeReactComponent = () => (
  <RaisedButton label="Default" />
);

function* fetchUser(action) {
   try {
      const user = yield call(fetch, action.payload.url);
      yield put({type: "USER_FETCH_SUCCEEDED", user: user});
   } catch (e) {
      yield put({type: "USER_FETCH_FAILED", message: e.message});
   }
}

function* mySaga() {
  yield* takeEvery("USER_FETCH_REQUESTED", fetchUser);
}

class HomeComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    setTimeout(() => {
      console.log("dispatching");
      this.props.dispatch({ type: 'TEST_ASYNC' });
    }, 5000)
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    console.log(state.kobble.get("test"));
    return {
      state,
      cards: state.kobble.get("test"),
      rowHeight: 150,
      cols: {xxxlg: 15, xxlg: 14, xlg: 13, lg: 12, md: 11, sm: 10, xs: 9, xxs: 8},
      breakpoints: {xxxlg: 1500, xxlg: 1400, xlg: 1300, lg: 1200, md: 1100, sm: 1000, xs: 900, xxs: 800},
      layouts: {lg:[
        {i: 'a', x: 0, y: 0, w: 2, h: 2, isResizable: false},
        {i: 'b', x: 2, y: 0, w: 2, h: 2, isResizable: false},
        {i: 'c', x: 4, y: 0, w: 2, h: 2, isResizable: false},
        {i: 'd', x: 6, y: 0, w: 2, h: 2, isResizable: false}
      ]}
    };
  }

  render() {
    console.log(this.props);
    return (
      <div className="home-layout-container">
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <MyAwesomeReactComponent />
        </MuiThemeProvider>
        <ResponsiveReactGridLayout className="home-layout" breakpoints={this.props.breakpoints} cols={this.props.cols} layouts={this.props.layouts} rowHeight={this.props.rowHeight}>
          <div className="home-card" key="a">a</div>
          <div className="home-card" key="b">b</div>
          <div className="home-card" key="c">c</div>
          <div className="home-card" key="d">c</div>
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
