'use babel';

import fs from 'fs';
import path from 'path';
import {Promise} from 'es6-promise';

export function exists(fn) {
  return new Promise((resolve,reject) => {
    fs.stat(fn, (err, stats) => {
      resolve(err ? false : true);
    });
  });
}

export function createDir(dir) {
  return new Promise((resolve,reject) => {
    fs.mkdir(dir, (err) => {
      if (err)
        reject(err);
      else
        resolve(true);
    });
  });
}

export function saveFile(fn, data) {
  return new Promise((resolve,reject) => {
    fs.writeFile(fn, data, (err) => {
      if (err)
        reject(err);
      else
        resolve(true);
    });
  });
}

export function readFile(fn, def) {
  return new Promise((resolve,reject) => {
    fs.readFile(fn, 'utf8', (err, data) => {
      if (err)
        resolve(def);
      else
        resolve(data);
    });
  });
}
