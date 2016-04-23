'use babel';

import React from 'react-for-atom';

var {Component} = React;


export default class HelloWorldComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
  }

  render(){
    return (
      <webview ref="root" className="block test-me" src="http://127.0.0.1:1880">
      </webview>
    );
  }
}
