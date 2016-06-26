'use babel';

import fs from 'fs';
import path from 'path';
import {exists, saveFile, readFile} from './utils';
let osenv = require('osenv');
let mkdirp = require('mkdirp');

export let homeDir = osenv.home();
export let kobbleDir = path.join(homeDir, ".kobble");
export let kobbleProjectsDir = path.join(kobbleDir, "projects");
mkdirp(kobbleProjectsDir, function(err) {
  if (err)
    console.error("Error creating kobble dir");
});

atom.project.addPath(kobbleDir);

let defaultSettings = {
  "serverUrl" : "http://localhost:3000"
}
let settingsFn = path.join(kobbleDir, "settings.json");

let settings = null;
export async function saveSettings() {
  await saveFile(settingsFn, JSON.stringify(settings));
}
export async function readSettings() {
  if (settings != null) return settings;
  if (!await exists(settingsFn))
    await saveFile(settingsFn, JSON.stringify(defaultSettings));
  return JSON.parse(await readFile(settingsFn));
}
readSettings().then((s) => settings = s);
