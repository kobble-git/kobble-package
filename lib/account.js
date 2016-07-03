'use babel';

import path from 'path';
import {Promise} from 'es6-promise';
import {klogin, kregister, kprofile, klogoff, cookiesExist} from './client';
import {readSettings, saveSettings} from './env';

import {runSaga, kobbleStore, kdispatch} from './store';
import _ from 'underscore-plus';
import {addReducer} from './reducer';
import React from 'react';
import ReactDOM from 'react-dom';
let {Component, PropTypes} = React;
import {openers, Opener, ComponentOpener} from './openers';

import {ErrorColor, KobbleColor} from './styles';

import { takeEvery, takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';

import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import AppBar from 'material-ui/AppBar';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import BackIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';

const LoginText = "Log In";
const LogoffText = "Log Off";
const SaveAccount = "SaveAccount";
const FetchAccount = "FetchAccount";
const ReducerName = "account";
const AccountValue = "AccountValue";
const AccountEmail = "AccountEmail";
const AccountPassword = "AccountPassword";
const AccountFirstName = "AccountFirstName";
const AccountLastName = "AccountLastName";
const AccountConfirmPassword = "AccountConfirmPassword";
const AccountLogin = "Login";
const AccountLogoff = "Logoff";
const AccountProfile = "Profile";
const AccountReset = "AccountReset";
const AccountRegistering = "Registering";
const AccountLoggingIn = "LoggingIn";
const AccountText = "AccountText";
const FetchAccountError = "FetchAccountError";
const IsLoggedIn = "IsLoggedIn";
const PasswordConfirmError = "PasswordConfirmError";
const PasswordTextError = "PasswordTextError";
const PasswordConfirmTextError = "PasswordConfirmTextError";
const ResetTextError = "ResetTextError";
const RegisterError = "RegisterError";
const LoginError = "LoginError";

addReducer(ReducerName, (state, action) => {
  switch (action.type) {
    case IsLoggedIn:
      return state.set(IsLoggedIn, true);
    case AccountLogoff:
      return state.set(IsLoggedIn, false);
    case AccountReset:
      return state.set(AccountRegistering, false).set(AccountLoggingIn, false);
    case AccountRegistering:
      return state.set(AccountRegistering, true).set(AccountLoggingIn, false);
    case AccountLoggingIn:
      return state.set(AccountLoggingIn, true).set(AccountRegistering, false);
    case AccountValue:
      return state.set(action.key, action.value);
    case PasswordConfirmError:
      return state.set(PasswordTextError, "passwords must match").set(PasswordConfirmTextError, "passwords must match");
    case ResetTextError:
      return state.set(PasswordTextError, "").set(PasswordConfirmTextError, "").set(RegisterError, "");
    case RegisterError:
      return state.set(RegisterError, action.args[0]);
    case LoginError:
      return state.set(LoginError, action.args[0]);
    case SaveAccount:
      return state.set(AccountProfile, action.account);
    default:
      return state;
  }
});

async function getAccount() {
  if (await cookiesExist()) {
    let {account} = await kprofile();
    kdispatch(IsLoggedIn);
    return account;
  } else {
    return {};
  }
}

function* fetchAccount(action) {
   try {
      const account = yield call(getAccount);
      console.log("profile", account);
      yield put({type: SaveAccount, account});
   } catch (e) {
      yield put({type: FetchAccountError, message: e.message});
   }
}

function* accountSaga() {
  yield* takeEvery(FetchAccount, fetchAccount);
}

// Kick start home page
runSaga(accountSaga);
kdispatch(FetchAccount);

class AccountComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  static mapStateToProps(state) {
    let account = state.kobble.get(ReducerName);
    return {
      state,
      account,
      profile: account.get(AccountProfile),
      isLoggedIn: account.get(IsLoggedIn),
      isRegistering: account.get(AccountRegistering),
      isLoggingIn: account.get(AccountLoggingIn),
      registerError: account.get(RegisterError),
      loginError: account.get(LoginError)
    };
  }

  async login(props) {
    kdispatch(ResetTextError);
    let email = props.account.get(AccountEmail);
    let password = props.account.get(AccountPassword);
    try {
      console.log("login", email, password);
      let result = await klogin(email, password);
      console.log("login", result);
      kdispatch(FetchAccount);
    } catch (e) {
      console.error(e);
      kdispatch(LoginError, e.message);
    }
  }

  async logoff() {
    //console.log("logoff");
    await klogoff();
    kdispatch(AccountLogoff);
  }

  purchase() {
    console.log("purchase");
  }

  async register(props) {
    kdispatch(ResetTextError);
    let firstname = props.account.get(AccountFirstName);
    let lastname = props.account.get(AccountLastName);
    let email = props.account.get(AccountEmail);
    let password = props.account.get(AccountPassword);
    let confirmPassword = props.account.get(AccountConfirmPassword);
    if (password != confirmPassword)
      kdispatch(PasswordConfirmError);
    else {
      try {
        //console.log("registering", firstname, lastname, email, password, confirmPassword);
        let result = await kregister(firstname, lastname, email, password);
        //console.log("registered", result);
        kdispatch(FetchAccount);
      } catch (e) {
        kdispatch(RegisterError, e.message);
      }
    }
  }

  reset() {
    kdispatch(AccountReset);
  }

  forgotPassword(props) {
    kdispatch(AccountReset);
  }

  enableLogin() {
    //console.log("enableLogin");
    kdispatch(AccountLoggingIn);
  }

  enableRegister() {
    //console.log("enableRegister");
    kdispatch(AccountRegistering);
  }

  handleChange = (event, key) => {
    kobbleStore.dispatch({type:AccountValue,key,value:event.target.value});
  };

  render() {
    let profile = this.props.profile || {};

    let textStyle = {
      marginTop: "7px",
      marginRight: "10px"
    };
    let buttonStyle = {
      color: 'white',
      marginLeft: "5px",
      marginRight: "5px"
    };
    let toolbarStyle = {
      "background-color": "#222"
    };
    let errorStyle = {
      color: ErrorColor
    };
    let loginStyle = {
      width : "50%",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: '#222'
    }
    let otherStyle = {
      width : "50%",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: '#222'
    }
    let enableStyle = {
    }
    let otherToolbarStyle = {
    }
    let registerStyle = {
      width : "50%",
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: '#222'
    }
    if (this.props.isLoggedIn) {
      loginStyle.display = "none";
      enableStyle.display = "none";
      registerStyle.display = "none";
    } else if (this.props.isRegistering) {
      otherStyle.display = "none";
      otherToolbarStyle.display = "none";
      loginStyle.display = "none";
    } else if (this.props.isLoggingIn) {
      otherStyle.display = "none";
      otherToolbarStyle.display = "none";
      registerStyle.display = "none";
    } else {
      otherStyle.display = "none";
      otherToolbarStyle.display = "none";
      loginStyle.display = "none";
      registerStyle.display = "none";
    }

    return (
      <div className="account-container">
        <Toolbar style={toolbarStyle}>
          <ToolbarGroup float="left" style={otherToolbarStyle}>
            <RaisedButton label="Log Off" style={buttonStyle} onClick={this.logoff}/>
            <RaisedButton label="Purchase" style={buttonStyle}  onClick={this.purchase} />
          </ToolbarGroup>
          <ToolbarGroup float="left" style={enableStyle}>
            <RaisedButton label="Log In" style={buttonStyle} onClick={this.enableLogin}/>
            <RaisedButton label="Register" style={buttonStyle}  onClick={this.enableRegister} />
          </ToolbarGroup>
        </Toolbar>
        <div>
          <div className="home-section" style={otherStyle}>
            <div>{profile.fullName}</div>
            <div>{profile.email}</div>
          </div>
          <div className="home-section" style={registerStyle}>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get("FirstNameTextError")} value={this.props.account.get(AccountFirstName)} hintText="Enter First Name" fullWidth={true} onChange={(e) => this.handleChange(e, "AccountFirstName")}/>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get("LastNameTextError")} value={this.props.account.get(AccountLastName)} hintText="Enter Last Name" fullWidth={true} onChange={(e) => this.handleChange(e, "AccountLastName")}/>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get("EmailTextError")} value={this.props.account.get(AccountEmail)} hintText="Enter Email Address" fullWidth={true} onChange={(e) => this.handleChange(e, AccountEmail)}/>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get(PasswordTextError)} value={this.props.account.get(AccountPassword)} hintText="Enter Password" fullWidth={true} onChange={(e) => this.handleChange(e, AccountPassword)}/>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get(PasswordConfirmTextError)} value={this.props.account.get(AccountConfirmPassword)} hintText="Confirm Password" fullWidth={true} onChange={(e) => this.handleChange(e, AccountConfirmPassword)}/>
            <br /><br /><RaisedButton label="Register" style={buttonStyle}  onClick={() => this.register(this.props)} />
            <div className="error-msg">{this.props.registerError}</div>
          </div>
          <div className="home-section" style={loginStyle}>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get("EmailErrorText")} value={this.props.account.get(AccountEmail)} hintText="Enter Email Address" fullWidth={true} onChange={(e) => this.handleChange(e, AccountEmail)}/>
            <TextField style={textStyle} errorStyle={errorStyle} errorText={this.props.account.get("PasswordErrorText")} value={this.props.account.get(AccountPassword)} hintText="Enter Password" fullWidth={true} onChange={(e) => this.handleChange(e, AccountPassword)}/>
            <br /><br /><RaisedButton label="Log In" style={buttonStyle} onClick={() => this.login(this.props)}/>
            <a onClick={() => this.forgotPassword(this.props)} className="pull-right forgot-password">Forgot Password</a>
            <div className="error-msg">{this.props.loginError}</div>
          </div>
        </div>
      </div>
    );
  }
}

openers.addOpener(".kob-account", (ext, ele, uri) => new ComponentOpener(uri, ele, AccountComponent));
