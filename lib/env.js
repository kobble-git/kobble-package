'use babel';

import path from 'path';
let osenv = require('osenv');
let mkdirp = require('mkdirp');

export let homeDir = osenv.home();
export let kobbleDir = path.join(homeDir, ".kobble")
export let kobbleProjectsDir = path.join(kobbleDir, "projects")
mkdirp(kobbleProjectsDir, function(err) {
  if (err)
    console.error("Error creating kobble dir");
});

atom.project.addPath(kobbleDir);
