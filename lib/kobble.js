'use babel';

import path from 'path';
import getport from 'getport';
import _ from 'underscore-plus';
import React from 'react-for-atom';
import { CompositeDisposable, Emitter } from 'event-kit';

let osenv = require('osenv');
let mkdirp = require('mkdirp');
let child = require('child_process');
let {Component} = React;

let homeDir = osenv.home();
let kobbleDir = path.join(homeDir, ".kobble")
let nodesDir = path.join(kobbleDir, "nodes");
mkdirp(nodesDir, function(err) {
  if (err)
    console.error("Error creating kobble nodes dir");
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
      console.log("kobfile:" + kobfile);
      opener.kob = child.spawn('node', ['./kobble-node-red.js', '' + port, kobfile, kobbleDir, nodesDir], {cwd:noderedDir});
      opener.port = port;
      opener.kob.on('message', (m) => {
        resolve(port);
        console.log('kobble got message:', JSON.stringify(m));
      });
      opener.kob.on('error', (err) => {
        console.log(err);
      });
      opener.kob.stderr.on('data', (data) => {
        console.log('stderr:' + data);
      });
      opener.kob.stdout.on('data', (data) => {
        let msg = ("" + data).trim();
        console.log('stdout:' + msg);
        if (_.startsWith(msg, "status:")) {
          let split = msg.split(':');
          if (split[1] == "kobble started") {
            console.log("resolving kobble started promise: " + port);
            resolve(port);
          }
        }
      });
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
    console.log("base opener:" + opener + ":" + _.keys(opener));
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
  console.log("kobble view:" + opener);
  let ele = new KobbleElement();
  return [ele.initialize(opener)];
}

class KobbleOpener {
  constructor(uri) {
    console.log("uriopener: " + JSON.stringify(uri));
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
