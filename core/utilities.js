//TODO: should this stand in a seperate file?

const fs = require('fs');
const _ = require('lodash');

class Utilities {
  constructor() {
    this.mixin();
  }

  mixin() {
    _.mixin({
      'pathExists': this.pathExists
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
}

module.exports = Utilities;
