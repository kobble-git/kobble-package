'use babel';

import url from 'url';
import path from 'path';
import request from 'request';
import {exists, createEmptyFile, deleteFile} from './utils';
import {Promise} from 'es6-promise';
import {runSaga, kobbleStore} from './store';
import FileCookieStore from 'tough-cookie-filestore';
import {kobbleDir, readSettings, saveSettings} from './env';

async function getCookieJar(name) {
  let fn = path.join(kobbleDir, name);
  if (await exists(fn)) {
    try {
      return request.jar(new FileCookieStore(fn));
    } catch (err) {
      console.error("invalid cookie jar, resetting");
    }
  }
  await createEmptyFile(fn);
  return request.jar(new FileCookieStore(fn));
}

export async function cookiesExist(jarName='cookies.json') {
  let fn = path.join(kobbleDir, jarName);
  return await exists(fn);
}

function getRequest(uri,method='GET',jarName='cookies.json') {
  return new Promise(async (resolve,reject) => {
    let jar = await getCookieJar(jarName);
    let opts = {uri,method,jar};
    request(opts, (err, response, body) => {
      //console.log("getRequest", opts, err, response, body);
      if (err || response.statusCode != 200) {
        console.error("getRequest", opts, err || body || response)
        reject(err || body || response);
      } else
        resolve(body);
    });
  });
}

function postRequest(uri,json,method='POST',jarName='cookies.json') {
  console.log("posting request");
  return new Promise(async (resolve,reject) => {
    try {
      let jar = await getCookieJar(jarName);
      let opts = {uri,method,json,jar};
      console.log(uri, method, json, jar);
      request(opts, (err, response, body) => {
        if (err || response.statusCode != 200) {
          console.error("postRequest", opts, err || body || response)
          reject(err || body || response);
        } else {
          console.log("resolving",body);
          resolve(body);
        }
      });
    } catch (e) {
      console.log("post request failed", e);
      reject(e);
    }
  });
}

export async function klogin(username, password) {
  let settings = await readSettings();
  let loginUrl = url.resolve(settings.serverUrl,'/login');
  console.log("login", loginUrl, username, password);
  return await postRequest(loginUrl,{username, password});
}

export async function klogoff() {
  let settings = await readSettings();
  let logoffUrl = url.resolve(settings.serverUrl,'/logoff');
  console.log("logoff", logoffUrl);
  await getRequest(logoffUrl);
  let fn = path.join(kobbleDir, "cookies.json");
  await deleteFile(fn);
}

export async function kregister(givenName, surname, email, password) {
  //console.log("kregister", email, password);
  let settings = await readSettings();
  let registerUrl = url.resolve(settings.serverUrl,'/register');
  //console.log("kregister", registerUrl);
  return await postRequest(registerUrl,{givenName, surname, email, password});
}

export async function kprofile() {
  let settings = await readSettings();
  let profileUrl = url.resolve(settings.serverUrl,'/me');
  let customDataUrl = url.resolve(settings.serverUrl,'/customData');
  console.log("profile", profileUrl);
  let profile = JSON.parse(await getRequest(profileUrl));
  let customData = JSON.parse(await getRequest(customDataUrl));
  let result = {profile,customData};
  console.log("kprofile", result);
  return result;
}
