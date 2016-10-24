//TODO: update way how logging is done.
'use strict';

const colors = require('colors');
const hbs = require('handlebars');
const schema = require('./schema');
const emoji = require('node-emoji');
const config = require('../config');

colors.setTheme({
  "error": "red",
  "warning": "yellow",
  "depecrated": "red",
  "debug": "blue",
  "log": "green",
  "docs": "yellow"
});

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

  message = message(d)[event.level];

  console.log(message);
  if(event.docs) {
    console.log(event.docs.docs);
  }

  return message;
};
