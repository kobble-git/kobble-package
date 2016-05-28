'use babel';

import path from 'path';
let osenv = require('osenv');
let mkdirp = require('mkdirp');
export let homeDir = osenv.home();
export let kobbleDir = path.join(homeDir, ".kobble")
mkdirp(kobbleDir, function(err) {
  if (err)
    console.error("Error creating kobble dir");
});
