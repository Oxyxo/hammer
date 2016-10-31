'use strict';

const db = require('@hammer/database');
const config = require('@hammer/config');
const plugins = require('@hammer/plugins');

const co = require('co');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const async = require('async');

class Themes {
  constructor(Hammer) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    this.active;
    config.default = {
      "themes": {
        "themesFolder": path.join(process.cwd(), 'themes'),
        "templatesFolder": "templates",
        "configFile": "theme.json"
      }
    };

    Promise.all([
      db.newTable('themes', {
        "id": {"type": "increments", "nullable": false, "primary": true},
        "name": {"type": "string", "maxlength": 150, "nullable": false, "unique": true},
        "folder": {"type": "string", "nullable": false},
        "active": {"type": "boolean", "nullable": false, "defaultTo": false}
      })
    ]).then(()=> {
      this.collect(config.get.themes.themesFolder).then(()=> {
        deferred.resolve(this);
      });
    });

    return promise;
  }

  collect(base) {
    let self = this;
    return co(function *() {
      let folders = fs.readdirSync(base),
          Themes = db.table('themes');

      let themes = yield Themes.where({});

      for(let i=0;i<themes.length;i++) {
        let theme = themes[i],
            folder = path.join(base, theme.folder);

        if(!_.pathExists(folder, 'isDirectory') || folders.indexOf(theme.folder) === -1) {
          Themes.where('id', theme.id).delete();
          continue;
        }

        folders.splice(folders.indexOf(theme.folder), 1);
      }

      for(let i=0;i<folders.length;i++) {
        let folder = folders[i],
            configPath = path.join(base, folder, config.get.themes.configFile);

        if(_.isHiddenPath(configPath)) {
          continue;
        }

        if(!_.pathExists(configPath)) {
          //TODO: log error when no config found.
          continue;
        }

        let themeConfig = fs.readJSONSync(configPath);
        yield Themes.insert({
          "name": themeConfig.name,
          "folder": folder
        });
      }
    });
  }

  getActiveTheme() {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let Themes = db.table('themes');
    Themes.where('active', 1).then((theme)=> {
      if(!theme) {
        return deferred.reject();
      }
      deferred.resolve(theme[0]);
    });

    return promise;
  }

  getActiveThemeFolder() {

  }

  activateTheme(theme) {
    db.table('themes').where('folder', theme).update('active', 1);
  }

  getTemplate(template) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    this.getActiveTheme().then((theme)=> {
      if(!theme) {
        return deferred.reject(new Error('no active theme'));
      }

      let file = path.join(config.get.themes.themesFolder, theme.folder, config.get.themes.templatesFolder, template);

      if(!_.pathExists(file)) {
        return deferred.reject(new Error('template does not exists'));
      }

      deferred.resolve(fs.readFileSync(file, 'utf-8'));
    });

    return promise;
  }
}

module.exports = Themes;
