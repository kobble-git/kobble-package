'use babel';

import path from 'path';
import { graphql} from './graphql';
import { kobbleStore } from './store';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider} from 'react-redux';
import { ApolloProvider, connect } from 'react-apollo';

class KobbleBaseElement extends HTMLElement {
  constructor() {
    super();
  }

  initialize(opener, component, store, client) {
    this.opener = opener;
    this.component = component;
    this.client = client || graphql.apolloClient;
    this.store = store || kobbleStore;
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
  return [ele.initialize(opener, component, opener.store, opener.client)];
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

export class ComponentOpener extends Opener {
  constructor(uri, ele, componentClass) {
    super(uri, ele);
    this.componentClass = componentClass;
  }

  component() {
    let o = ['mapStateToProps', 'mapDispatchToProps', 'mapQueriesToProps', 'mapMutationsToProps'].reduce((o,map) => {
      if (this.componentClass[map])
        o[map] = this.componentClass[map];
      return o;
    }, {});
    let Container = connect(o)(this.componentClass);
    let c =
        <Container opener={this}>
        </Container>;
    return c;
  }

  destroy() {
  }
}

let KobbleElement = document.registerElement('kobble-element', {
  prototype: KobbleBaseElement.prototype,
});

class Openers {
  constructor() {
    this.openers = {};
  }

  addOpener(ext, f) {
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
