'use babel';

import url from 'url';
import path from 'path';
import request from 'request';
import {exists, createFile} from './utils';
import {Promise} from 'es6-promise';
import {runSaga, kobbleStore} from './store';
import FileCookieStore from 'tough-cookie-filestore';
import {kobbleDir, readSettings, saveSettings} from './env';

async function getCookieJar(name) {
  let fn = path.join(kobbleDir, name);
  if (!await exists(fn))
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
      if (err || response.statusCode != 200) {
        console.error("postRequest", opts, err || body || response)
        reject(err || body || response);
      } else
        resolve(body);
    });
  });
}

function postRequest(uri,json,method='POST',jarName='cookies.json') {
  return new Promise(async (resolve,reject) => {
    let jar = await getCookieJar(jarName);
    let opts = {uri,method,json,jar};
    request(opts, (err, response, body) => {
      if (err || response.statusCode != 200) {
        console.error("postRequest", opts, err || body || response)
        reject(err || body || response);
      } else
        resolve(body);
    });
  });
}

export async function klogin(email, password) {
  let settings = await readSettings();
  let loginUrl = url.resolve(settings.serverUrl,'/login');
  console.log("login", loginUrl, email, password);
  return {}; //await postRequest(loginUrl);
}

export async function klogoff() {
  let settings = await readSettings();
  let logoffUrl = url.format({host:settings.serverUrl,pathname:'logoff'});
  console.log("logoff", logoffUrl);
  return {};//await postRequest(logoffUrl);
}

export async function kregister(givenName, surname, email, password) {
  console.log("kregister", email, password);
  let settings = await readSettings();
  let registerUrl = url.resolve(settings.serverUrl,'/register');
  console.log("kregister", registerUrl);
  return await postRequest(registerUrl,{givenName, surname, email, password});
}

export async function kprofile() {
  let settings = await readSettings();
  let profileUrl = url.resolve(settings.serverUrl,'/me');
  console.log("profile", profileUrl);
  return await getRequest(profileUrl);
}
