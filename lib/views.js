'use babel';

import {CompositeDisposable, Emitter} from 'atom';
import {ComponentOpener, KobbleElement} from './openers';

export class PanelView {

  constructor (position, uri, componentClass) {
    this.uri = uri;
    this.panel = null;
    this.position = position;
    this.emitter = new Emitter();
    this.element = new KobbleElement();
    this.componentClass = componentClass;
    this.subscriptions = new CompositeDisposable();
    console.log("contructed panel view");
  }

  destroy () {
    this.subscriptions.dispose();
    this.subscriptions = null;
    this.hide();
    this.element = null;

    this.emitter.emit('did-destroy');
    this.emitter.dispose();
    this.emitter = null;
  }

  hide () {
    if (this.panel != null) {
      this.panel.destroy();
      this.panel = null;
    }
  }

  show () {
    this.hide();
    this.updatePosition();
  }

  calculatePriority (item) {
    return !isNaN(item.priority) ? item.priority : 50;
  }

  updatePosition() {
    console.log("creating opener");
    this.opener = new ComponentOpener(this.uri, this.element, this.componentClass);
    console.log("created opener");
    let component = this.opener.component();
    console.log("created component");
    this.element.initialize(this.opener, component);
    console.log("update position");
    switch (this.position) {
      case 'Top':
        this.panel = atom.workspace.addHeaderPanel({item: this.element})
        break;
      case 'Right':
        this.panel = atom.workspace.addRightPanel({item: this.element});
        break;
      case 'Bottom':
        this.panel = atom.workspace.addFooterPanel({item: this.element})
        break;
      case 'Left':
        this.panel = atom.workspace.addLeftPanel({item: this.element, priority: 50});
        break;
    }
    console.log("position updated");

  }

}
