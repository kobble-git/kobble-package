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

import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const HomeCard = () => (
  <Card className="home-card-container">
    <CardHeader
      title="URL Avatar"
      subtitle="Subtitle"
      avatar="http://lorempixel.com/100/100/nature/"
    />
    <CardTitle title="Card title" subtitle="Card subtitle" />
    <CardText>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
      Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
      Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
    </CardText>
    <CardActions>
      <FlatButton label="Install" />
    </CardActions>
  </Card>);

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
      cols: {xxxlg: 11, xxlg: 10, xlg: 9, lg: 8, md: 7, sm: 6, xs: 5, xxs: 4},
      breakpoints: {xxxlg: 1650, xxlg: 1500, xlg: 1350, lg: 1200, md: 1050, sm: 900, xs: 750, xxs: 600},
      layouts: {xxxlg:[
        {i: 'a', x: 0, y: 0, w: 2, h: 3, isResizable: false},
        {i: 'b', x: 2, y: 0, w: 2, h: 3, isResizable: false},
        {i: 'c', x: 4, y: 0, w: 2, h: 3, isResizable: false},
        {i: 'd', x: 6, y: 0, w: 2, h: 3, isResizable: false}
      ]}
    };
  }

  render() {
    console.log(this.props);
    return (
      <div className="home-layout-container">
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <ResponsiveReactGridLayout className="home-layout" breakpoints={this.props.breakpoints} cols={this.props.cols} layouts={this.props.layouts} rowHeight={this.props.rowHeight}>
            <div className="home-card-container" key="a" >
              <HomeCard className="home-card" />
            </div>
            <div className="home-card-container" key="b" >
              <HomeCard className="home-card" />
            </div>
            <div className="home-card-container" key="c" >
              <HomeCard className="home-card" />
            </div>
            <div className="home-card-container" key="d" >
              <HomeCard className="home-card" />
            </div>
          </ResponsiveReactGridLayout>
        </MuiThemeProvider>
      </div>
    );
  }
}

openers.addOpener(".kob-home", (ext, ele, uri) => new ComponentOpener(uri, ele, HomeComponent));
