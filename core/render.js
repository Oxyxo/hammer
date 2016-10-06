'use strict';

const _ = require('lodash');
const hbs = require('handlebars');
const modules = require('./modules');

class Render {
  constructor() {
    modules.extend('render', this);
    this._data = [];
  }

  serve(source) {
    let template = hbs.compile(source);

    return (data)=> {
      return template(Object.assign(this._data, data));
    };
  }

  setRenderData(data) {
    this._data.push(data);
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
}

module.exports = new Render();
