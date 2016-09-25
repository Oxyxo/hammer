const schema = require('./schema.json');
//const hbs = require('handlebars');

module.exports = (e, d = {})=> {
  //TODO: render message with handlebars
  if(!schema[e]) {
    return console.log(`Log event: ${e} not found`);
  }

  if(!schema[e].message) {
    return console.log(`No message found for event: ${e}`);
  }

  console.log(schema[e].message);

  //NOTE: let's change the naming of this element?
  if(d.code) {
    console.log(d.code);
  }
};
