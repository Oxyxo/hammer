'use strict';

//TODO: should this stand in a seperate file?

const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');

class Utilities {
  constructor() {
    this.mixin();
  }

  mixin() {
    _.mixin({
      'pathExists': this.pathExists,
      'isHidden': this.isHidden,
      'decode': this.decode,
      'fileType': this.fileType,
      'joinUrl': this.joinUrl,
      'normalizeUrl': this.normalizeUrl
    });
  }

  pathExists(path, type) {
    try {
      let stats = fs.lstatSync(path);
      if(type && !stats[type]()) {
        return false;
      }
    } catch(e) {
      return false;
    }

    return true;
  }

  isHidden(root, path) {
    path = path.substr(root.length).split(path.sep);
    for(var i = 0; i < path.length; i++) {
      if(path[i][0] === '.') return true;
    }
    return false;
  }

  decode(path) {
    try {
      return decodeURIComponent(path);
    } catch (err) {
      return -1;
    }
  }

  fileType(file) {
    return mime.lookup(file);
  }

  normalizeUrl(str) {
    // make sure protocol is followed by two slashes
    str = str.replace(/:\//g, '://');

    // remove consecutive slashes
    str = str.replace(/([^:\s])\/+/g, '$1/');

    // remove trailing slash before parameters or hash
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    // replace ? in parameters with &
    str = str.replace(/(\?.+)\?/g, '$1&');

    return str;
  }

  joinUrl() {
    var input = arguments;
    var options = {};

    if(typeof arguments[0] === 'object') {
      // new syntax with array and options
      input = arguments[0];
      options = arguments[1] || {};
    }

    var joined = [].slice.call(input, 0).join('/');
    return _.normalizeUrl(joined, options);
  }
}

module.exports = Utilities;
