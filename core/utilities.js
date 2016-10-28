'use strict';

const fs = require('fs');
const _ = require('lodash');
const mime = require('mime');
const config = require('./config');

/**
 * The utilities class contains small
 * tools that are used though out the
 * system.
 * @class Utilities
 */
class Utilities {
  /**
   * The constructor extends the default config
   * and mixes helper into lodash.
   * @constructs Utilities
   */
  constructor() {
    config.default = {
      "isHiddenPath": /\/\.\w+/
    };

    _.mixin({
      "pathExists": this.pathExists,
      "isHiddenPath": this.isHiddenPath,
      "decode": this.decode,
      "fileType": this.fileType,
      "joinUrl": this.joinUrl,
      "normalizeUrl": this.normalizeUrl
    });
  }

  /**
   * The pathExists helper checks if the given path exits.
   * if the path does not exist with the optionally given type
   * does it return false. When exitsts does it return true.
   * @method    Utilities@pathExists
   * @example   _.pathExists('/home', 'isDirectory');
   * @param     {String} path the absolute path that you want to test.
   * @param     {String} type *optionally* the type of the path.
   */
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

  /**
   * This function checks if the given path is a hidden path.
   * It uses the isHiddenPath object from the config.
   * @method    Utilities@isHiddenPath
   * @example   _.isHiddenPath('/home/admin/.ssh/config');
   * @param     {String} path the absolute path that you want to test.
   */
  isHiddenPath(path) {
    return config.get.isHiddenPath.test(path);
  }

  /**
   * The decode() function decodes a Uniform Resource Identifier (URI) component
   * previously created by encodeURIComponent or by a similar routine.
   * @method    Utilities@decode
   * @example   _.decode('JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
   * @param     {String} path
   */
  decode(path) {
    try {
      return decodeURIComponent(path);
    } catch (err) {
      return -1;
    }
  }

  /**
   * The fileType() function looks up the mime of the given file
   * with the npm package mime.
   * @method    Utilities@fileType
   * @example   _.fileType('/template/index.html');
   * @param     {String} file path/name of file
   * @returns   {String} type the type of the given file if found.
   */
  fileType(file) {
    return mime.lookup(file);
  }

  /**
   * The normalizeUrl() function removes double slashes,
   * makes sure the protocol is followd by two slashes,
   * removes trailing slashes before parameters or hash,
   * replaces ? in parameters with &.
   * @method    Utilities@normalizeUrl
   * @example   _.normalizeUrl('http://github.com//projecthammer//hammer');
   * @param     {String} str A url that needs to be normalized
   * @returns   {String} the normalized version of the given url
   */
  normalizeUrl(str) {
    // make sure protocol is followed by two slashes
    str = str.replace(/:\//g, '://');

    // remove consecutive slashes
    str = str.replace(/([^:\s])\/+/g, '$1/');

    // remove trailing slash before parameters or hash
    str = str.replace(/\/(\?|&|#[^!])/g, '$1');

    // replace ? in parameters with &
    str = str.replace(/(\?.+)\?/g, '$1&');

    return str;
  }

  /**
  * The joinUrl() function join's the given
  * strings in to a usable string.
  * @method    Utilities@normalizeUrl
  * @example   _.joinUrl('http://', 'github.com/', 'projecthammer', 'hammer');
  * @param     {String} arguments The url's that you want to join.
  * @returns   {String} the joined version of the given arguments.
   */
  joinUrl() {
    var input = arguments;
    var options = {};

    if(typeof arguments[0] === 'object') {
      // new syntax with array and options
      input = arguments[0];
      options = arguments[1] || {};
    }

    var joined = [].slice.call(input, 0).join('/');
    return _.normalizeUrl(joined, options);
  }
}

module.exports = Utilities;
