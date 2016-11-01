//TODO: update way how logging is done.
'use strict';

const chalk = require('chalk');
const hbs = require('handlebars');
const schema = require('./schema');
const emoji = require('node-emoji');
const config = require('../config');

module.exports = (e, d = {})=> {
  if(!config.get.logging) {
    return;
  }

  if(!schema[e]) {
    return console.log(`Log event: ${e} not found`.error);
  }

  if(!schema[e].message) {
    return console.log(`No message found for event: ${e}`.error);
  }

  let event = schema[e],
      message = hbs.compile(emoji.emojify(event.message));

  console.log(message(d));
  if(event.docs) {
    console.log(event.docs.docs);
  }

  return message;
};
