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

export function createEmptyFile(fn) {
  return new Promise((resolve,reject) => {
    fs.open(fn, "w", (err, fd) => {
      if (err)
        reject(err);
      else {
        fs.close(fd, (err) => {
          console.log("cannot close createEmptyFile", err, fn);
        });
        resolve(true);
      }
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

export function saveJsonFile(fn, data) {
  return new Promise((resolve,reject) => {
    fs.writeFile(fn, JSON.stringify(data), (err) => {
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

export function readJsonFile(fn, def) {
  return new Promise((resolve,reject) => {
    fs.readFile(fn, 'utf8', (err, data) => {
      if (err)
        resolve(def);
      else
        resolve(JSON.parse(data));
    });
  });
}

export function listDirectories(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isDirectory();
  });
}

export function listFiles(dir) {
  return fs.readdirSync(dir).filter(function(file) {
    return fs.statSync(path.join(dir, file)).isFile();
  });
}

function getDirectories(srcpath) {
}
