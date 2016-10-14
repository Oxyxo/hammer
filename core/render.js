'use strict';

const _ = require('lodash');
const marked = require('marked');
const bluebird = require('bluebird');
const promiseHbs = require('promised-handlebars');
const hbs = promiseHbs(require('handlebars'), {Promise, bluebird});

/**
 * This function handles all render functions.
 * Every page render goes through here.
 *
 * @class Render
 */
class Render {
  constructor() {
    this._data = [];
    marked.setOptions({
      breaks: true
    });
  }

  serve(source) {
    let template = hbs.compile(source);

    return (data = {})=> {
      return template(Object.assign(this.renderData, data));
    };
  }

  setDefaultRenderData(data) {
    this._data.push(data);
  }

  markdown(source) {
    return marked(source);
  }

  /**
   * This function prepares page data to be
   * fed into the render function. The name of
   * the data is defined by the stored identifier
   *
   * @method   Render@pageData
   * @param    {Array} data Every object in this array needs to have the following properties: identifier, content, type. These are needed to render and set the data
   * @return   {Object} The returned object contains the given data placed their identified properties
   */
  pageData(data = []) {
    let ret = {};

    for(let i=0;i<data.length;i++) {
      let object = data[i];
      if(!object.identifier || !object.content || !object.type) {
        continue;
      }

      //TODO: add support for multiple content types
      //TODO: create option for middleware/plugins to extend content types
      switch(object.type) {
        case 'markdown':
          object.content = new hbs.SafeString(this.markdown(object.content));
          break;
      }
      ret[object.identifier] = object.content;
    }

    return ret;
  }

  get renderData() {
    let data = {};
    for(let i=0;i<this._data.length;i++) {
      let _data = this._data[i];

      if(_.isFunction(_data)) {
        _data = _data();
      }

      data = Object.assign(data, _data);
    }

    return data;
  }

  helper(name, fn) {
    hbs.registerHelper(name, function() {
      let deferred = Promise.defer(),
          promise = deferred.promise;

      let args = Object.keys(arguments).map(x => arguments[x]);
      args.unshift(deferred);

      fn.apply(this, args);
      return promise;
    });
  }
}

module.exports = new Render();
