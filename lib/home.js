'use babel';

import path from 'path';
import {openers, Opener} from './openers';
import {React, ReactDOM} from 'react-for-atom';
let {Component} = React;

class HomeComponent extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  render(){
    return (<center>Home</center>);
  }
}

class HomeOpener extends Opener {
  constructor(uri, ele) {
    super(uri, ele);
  }

  component() {
    let c =
        <HomeComponent opener={this}>
        </HomeComponent>;
    return c;
  }

  destroy() {
  }
}

openers.addOpener(".kob-home", 'kobble-home-element', (ext, ele, uri) => new HomeOpener(uri, ele));
