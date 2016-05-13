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

let KobbleElement = document.registerElement('kobble-element', {
  prototype: KobbleBaseElement.prototype,
});

function KobbleView(opener) {
  let ele = new KobbleElement();
  let component = opener.component();
  return [ele.initialize(opener, component)];
}

export class Opener {
  constructor(uri, openPermanent = true) {
    this.uri = uri;
    this.openPermanent = openPermanent;
    this.tabTitle = path.parse(uri).base;
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

class Openers {
  constructor() {
    this.openers = {};
  }

  addOpener(ext, f) {
    this.openers[ext] = f;
  }

  findOpener(ext, uri) {
    let o = this.openers[ext];
    return o ? o(ext, uri) : undefined;
  }
}

export let openers = new Openers();
