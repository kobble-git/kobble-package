'use babel';

import atom from 'atom';
import path from 'path';
import jsdom from 'jsdom';
import _ from 'underscore-plus';
import {Promise} from 'es6-promise';

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

export let noderedNodes = [];
export let noderedFlows = [];

export async function noderedRefresh() {
  console.log("load flows");
  let window = await loadPage("http://flows.nodered.org/");
  let nodesa = window.$(".gistbox.gistbox-node a");
  let flowsa = window.$(".gistbox.gistbox-flow a");
  console.log("flows loaded:" + flowsa.length);
  console.log("nodes loaded:" + nodesa.length);

  let flowhrefs = _.map(flowsa, (flow) => flow.href);
  let nodehrefs = _.map(nodesa, (node) => node.href);
  console.log(flowhrefs);

  let ns = window.$("li.gistbox.gistbox-node");
  let fs = window.$("li.gistbox.gistbox-flow");
  console.log("flows li loaded:" + fs.length);
  console.log("nodes li loaded:" + ns.length);
  let flowtags = _.map(fs, (f) => window.$(f).attr('data-tags'));
  let nodetags = _.map(ns, (n) => window.$(n).attr('data-tags'));

  console.log(nodetags);
  console.log("returning from nodredRefresh")
  return {noderedNodes, noderedFlows};
}
