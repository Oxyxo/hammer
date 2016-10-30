'use strict';

let Hammer = require('./core'),
    App; // In app is the current Hammer instance stored.

/**
 * With this function can you create a new Hammer instance
 * or retrieve the current Hammer instance.
 * @example let Hammer = require('projecthammer');
 */
module.exports = function(config = {}) {
  if(App) {
    return App;
  }

  // If no current Hammer instance is found is a new one created.
  return new Hammer(config).then((core)=> {
    App = core;
  });
};
