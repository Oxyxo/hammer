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
      'fileType': this.fileType
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
}

module.exports = Utilities;
