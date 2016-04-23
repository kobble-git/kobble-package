'use babel';

import React from 'react-for-atom';
var {Component} = React;

class KobbleComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
  }

  render(){
    return (
      <webview ref="root" className="block test-me" src="http://127.0.0.1:" + {props.port}>
      </webview>
    );
  }
}

class KobbleElement extends HTMLElement {

  initialize(port) {
    this.port = port;
    return this;
  }

  setVisibility(visible){
      React.render(
          <KobbleComponent port={this.port}>
          </KobbleComponent>,
        this
      );
  }

  attachedCallback() {
    React.render(
        <KobbleComponent port={this.port}>
        </KobbleComponent>,
      this
    );
  }

  detachedCallback() {
    React.unmountComponentAtNode(this);
  }

}
//import HelloWorldElement from './HelloWorldElement';
export default function KobbleView() {
  console.log("kobble view:" + port);
  let ele = new KobbleElement();
  return [ele.initialize(port)];
}
