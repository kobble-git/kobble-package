'use babel';

import path from 'path';
import KobbleView from './kobble-view';

export default class KobbleOpener {
  constructor(uri) {
    console.log("uriopener: " + JSON.stringify(uri))
    this.uri = uri;
    this.tabTitle = path.parse(uri).base;
  }

  getTitle() {
    return this.tabTitle;
  }

  getViewClass() {
    return KobbleView;
  }

  destroy() {
    console.log('destroy');
  }

  getURI() {
    return this.uri;
  }

}
