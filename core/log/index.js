const schema = require('./schema');
const handlebars = require('handlebars');

module.exports = (e, d = {})=> {
  if(!schema[e]) {
    return console.log(`Log event: ${e} not found`);
  }

  if(!schema[e].message) {
    return console.log(`No message found for event: ${e}`);
  }

  //TODO: build a log output
  console.log(e);
  //console.log(schema[e].message);

  return schema[e].message;
};
