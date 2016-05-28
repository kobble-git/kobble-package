'use babel';

import fs from 'fs';
import atom from 'atom';
import path from 'path';
import jsdom from 'jsdom';
import _ from 'underscore-plus';
import {Promise} from 'es6-promise';
import {homeDir,kobbleDir} from './env';

function loadPage(url) {
  return new Promise(function(resolve, reject) {
    jsdom.env(
      url,
      ["http://code.jquery.com/jquery.js"],
      function (err, window) {
        resolve(window);
      }
    );
  });
}

function save(name, js) {
  return new Promise(function(resolve, reject) {
    let fn = path.join(kobbleDir,name + ".json");
    let data = JSON.stringify(js);
    fs.writeFile(fn, data, (err) => {
      if (err)
        console.error(err);
      resolve(true);
    });
  });
}

function restore(name) {
  return new Promise(function(resolve, reject) {
    let fn = path.join(kobbleDir,name + ".json");
    fs.readFile(fn, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        resolve([]);
      } else {
        let js = JSON.parse(data);
        resolve(js);
      }
    });
  });
}

let noderedNodes = null;
let noderedFlows = restore("shared-flows");

async function noderedRefresh() {
  let window = await loadPage("http://flows.nodered.org/");

  let nodesa = window.$(".gistbox.gistbox-node a");
  let flowsa = window.$(".gistbox.gistbox-flow a");
  let flowhrefs = _.map(flowsa, (flow) => flow.href);
  let nodehrefs = _.map(nodesa, (node) => node.href);

  let nodest = window.$(".gistbox.gistbox-node h1");
  let flowst = window.$(".gistbox.gistbox-flow h1");
  let flowtitle = _.map(flowst, (flow) => window.$(flow).text());
  let nodetitle = _.map(nodest, (node) => window.$(node).text());

  let nodesd = window.$(".gistbox.gistbox-node p");
  let flowsd = window.$(".gistbox.gistbox-flow p");
  let flowdesc = _.map(flowsd, (flow) => window.$(flow).text());
  let nodedesc = _.map(nodesd, (node) => window.$(node).text());

  let ns = window.$("li.gistbox.gistbox-node");
  let fs = window.$("li.gistbox.gistbox-flow");
  let flowtags = _.map(fs, (f) => window.$(f).attr('data-tags'));
  let nodetags = _.map(ns, (n) => window.$(n).attr('data-tags'));

  let nodez = _.zip(nodehrefs, nodetitle, nodetags, nodedesc);
  let flowz = _.zip(flowhrefs, flowtitle, flowtags, flowdesc);

  noderedNodes = _.map(nodez, (zn) => {
    return {
      href:zn[0],
      title:zn[1],
      tags:zn[2].split(","),
      desc:zn[3]
    };
  });

  noderedFlows = _.map(flowz, (zn) => {
    return {
      href:zn[0],
      title:zn[1],
      tags:zn[2].split(",")
    };
  });

  save("shared-nodes", noderedNodes);
  save("shared-flows", noderedFlows);
}

export async function noderedGetFlows(refresh=false) {
  if (noderedFlows===null||refresh)
    noderedFlows = await restore("shared-flows");
  if (noderedFlows.length === 0)
    await noderedRefresh();
  return noderedFlows;
}

export async function noderedGetNodes(refresh=false) {
  if (noderedNodes === null||refresh)
    noderedNodes = await restore("shared-nodes");
  if (noderedNodes.length === 0)
    await noderedRefresh();
  return noderedNodes;
}
