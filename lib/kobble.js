'use babel';

import path from 'path';
import getport from 'getport';
import _ from 'underscore-plus';
import React from 'react-for-atom';
import {BufferedNodeProcess} from 'atom';
import { CompositeDisposable, Emitter } from 'event-kit';

let osenv = require('osenv');
let mkdirp = require('mkdirp');
let {Component} = React;

let homeDir = osenv.home();
let kobbleDir = path.join(homeDir, ".kobble")
mkdirp(kobbleDir, function(err) {
  if (err)
    console.error("Error creating kobble dir");
});

function getUnusedPort() {
  return new Promise((resolve,reject) => {
    getport(function (e, p) {
      if (e) reject(e);
      else resolve(p);
    });
  });
}

let noderedDir = 'D:/node-red';
function startKobbleInstance(opener) {
  return new Promise(async (resolve,reject) => {
    try {
      let port = await getUnusedPort();
      console.log("starting kobble instance: " + port);
      let kobfile = opener.getURI();
      let userDir = path.dirname(kobfile)
      console.log("kobfile:" + kobfile);
      let bopts = {
        "command": 'kobble-node-red.js',
        "options": {"cwd": noderedDir},
        "args": ['' + port, kobfile, kobbleDir, userDir],
        "stdout" : (data) => {
          let msg = ("" + data).trim();
          console.log('stdout:' + msg);
          if (msg.indexOf("status:") === 0) {
            let split = msg.split(':');
            if (split[1] == "kobble started") {
              console.log("resolving kobble started promise: " + port);
              resolve(port);
            }
          }
        },
        "stderr": (err) => {
          console.log(err);
        }
      };
      opener.port = port;
      opener.kob = new BufferedNodeProcess(bopts);
    } catch (err) {
      reject(err);
    }
  });
}

atom.workspace.onDidAddPaneItem(({pane}) => {
  try {
    if (pane.getPendingItem() && pane.getPendingItem() != null && pane.getPendingItem().isKobbleOpener)
      pane.setPendingItem(null);
  } catch (err) {
  }
});

class KobbleComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "port" : 0,
      "error" : null,
      "loading" : true,
      "progress" : "Loading kobble..."
    };
  }

  getInitialState() {
    console.log("getInitialState");
    return {
      "port" : 0,
      "error" : null,
      "loading" : true
    }
  }

  componentWillMount() {
    console.log("comp opener:" + this.props.opener + ":" + _.keys(this.props.opener));
    this.props.port =  startKobbleInstance(this.props.opener);
  }

  componentDidMount() {
    this.props.port.then((port) => {
      console.log("set state: " + port);
      this.setState({"port" : port, "loading" : false, "error": null, "progress": "done"});
    }).catch((err) => {
      console.log("set state err: " + err);
      this.setState({"port" : 0, "loading" : false, "error": "" + err, "progress": ""});
    })
  }

  render(){
    if (this.state.loading) {
      return (<center className="spinner">
        <div className="progress">{this.state.progress}</div>
        <div className="loader rspin">
          <span className="c"></span>
          <span className="d spin"><span className="e"></span></span>
          <span className="r r1"></span>
          <span className="r r2"></span>
          <span className="r r3"></span>
          <span className="r r4"></span>
        </div>
      </center>);
    } else if (this.state.error !== null) {
      return <div>Error: {this.state.error}</div>;
    } else {
      let port = this.state.port;
      let uri = "http://127.0.0.1:" + port;
      console.log('loading webview: ' + uri);
      return (
        <webview ref="root" className="block" src={uri}>
        </webview>
      );
    }
  }
}

class KobbleBaseElement extends HTMLElement {
  constructor() {
    super();
  }

  initialize(opener) {
    this.opener = opener;
    return this;
  }

  setVisibility(visible){
      React.render(
          <KobbleComponent opener={this.opener}>
          </KobbleComponent>,
        this
      );
  }

  attachedCallback() {
    React.render(
        <KobbleComponent opener={this.opener}>
        </KobbleComponent>,
      this
    );
  }

  detachedCallback() {
    React.unmountComponentAtNode(this);
  }

}

let KobbleElement = document.registerElement('kobble-element', {
  prototype: KobbleBaseElement.prototype,
});

function KobbleView(opener) {
  let ele = new KobbleElement();
  return [ele.initialize(opener)];
}

class KobbleOpener {
  constructor(uri) {
    this.uri = uri;
    this.tabTitle = path.parse(uri).base;
  }

  isKobbleOpener() {
    return true;
  }

  getTitle() {
    return this.tabTitle;
  }

  getViewClass() {
    return KobbleView;
  }

  destroy() {
    if (this.kob) {
      console.log("killing kobble process: " + this.port);
      this.kob.kill('SIGINT');
    }
    console.log('destroy');
  }

  getURI() {
    return this.uri;
  }

}

class Kobble {
  constructor() {
    this.active = false;
  }

  isActive() {
    return this.active;
  }

  activate(state) {
    this.active = true;
    console.log("activating kobble");
    atom.workspace.addOpener((uri) => {
      let ext = path.extname(uri);
      if (ext === ".kob") {
        let opener = new KobbleOpener(uri);
        return opener;
      }
      return undefined;
    });
  }

  deactivate() {
    this.active = false;
    console.log("deactivating Kobble");
  }
}

export default new Kobble();
