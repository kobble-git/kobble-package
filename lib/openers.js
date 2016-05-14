'use babel';

import path from 'path';
import { newStore } from './store';
import { Provider } from 'react-redux';
import { ApolloProvider } from 'react-apollo';
import {React, ReactDOM} from 'react-for-atom';

class KobbleBaseElement extends HTMLElement {
  constructor() {
    super();
  }

  initialize(opener, component) {
    this.opener = opener;
    this.component = component;
    this.store = newStore();
    return this;
  }

  setVisibility(visible){
    ReactDOM.render(
      <ApolloProvider store={this.store} client={this.client}>{this.component}</ApolloProvider>,
      this);
  }

  attachedCallback() {
    ReactDOM.render(
      <ApolloProvider store={this.store} client={this.client}>{this.component}</ApolloProvider>,
      this);
  }

  detachedCallback() {
    ReactDOM.unmountComponentAtNode(this);
  }
}

function KobbleView(opener) {
  let ele = opener.ele;
  let component = opener.component();
  return [ele.initialize(opener, component)];
}

export class Opener {
  constructor(uri, ele, openPermanent = true) {
    this.uri = uri;
    this.ele = ele;
    this.openPermanent = openPermanent;
    this.tabTitle = path.parse(uri).name;
  }

  getTitle() {
    return this.tabTitle;
  }

  getViewClass() {
    return KobbleView;
  }

  getURI() {
    return this.uri;
  }

}

let KobbleElement = document.registerElement('kobble-element', {
  prototype: KobbleBaseElement.prototype,
});

class Openers {
  constructor() {
    this.openers = {};
  }

  addOpener(ext, eleName, f) {
    if (!this.openers[ext]) {
      let ele = {};
      this.openers[ext] = {ele, f};
    }
  }

  findOpener(ext, uri) {
    let o = this.openers[ext];
    if (!o) return undefined;
    let {ele, f} = o;
    return f ? f(ext, new KobbleElement(), uri) : undefined;
  }
}

export let openers = new Openers();
