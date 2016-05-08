'use babel';

import path from 'path';
import {React, ReactDOM} from 'react-for-atom';

class KobbleBaseElement extends HTMLElement {
  constructor() {
    super();
  }

  initialize(opener, component) {
    this.opener = opener;
    this.component = component;
    return this;
  }

  setVisibility(visible){
      ReactDOM.render(
          this.component,
        this
      );
  }

  attachedCallback() {
    ReactDOM.render(
      this.component,
      this
    );
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
