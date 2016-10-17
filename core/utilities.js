//TODO: should this stand in a seperate file?

const fs = require('fs');
const _ = require('lodash');

class Utilities {
  constructor() {
    this.mixin();
  }

  mixin() {
    _.mixin({
      'pathExists': this.pathExists,
      'isHidden': this.isHidden
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
    path = path.substr(root.length).split(sep);
    for(var i = 0; i < path.length; i++) {
      if(path[i][0] === '.') return true;
    }
    return false;
  }
}

module.exports = Utilities;
