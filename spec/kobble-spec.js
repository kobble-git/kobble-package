'use babel';

import Kobble from '../lib/kobble';

describe("Kobble", function() {
  var editor,
      ref,
      workspaceElement;

  beforeEach(function() {
    workspaceElement = atom.views.getView(atom.workspace);
    jasmine.attachToDOM(workspaceElement);
    waitsForPromise(function() { 
      return atom.workspace.open('sample.js');
    });
    runs(function() {
      editor = atom.workspace.getActiveTextEditor();
      editor.setText("This is the file content");
    });
    return waitsForPromise(function() {
      return atom.packages.activatePackage('kobble');
    });
  });
  describe("kobble active", function() {
    it("lives", function() {
      expect('life').toBe('easy');
    });
  });
});
