'use strict';

const Hammer = global.Hammer;
const Modules = Hammer.modules;

const db = Modules.database;
const config = Modules.config;
const plugins = Modules.plugins;

const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const async = require('async');

class Themes {
  constructor(Hammer) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    config.expandDefault({
      "themes": {
        "themesFolder": path.join(process.cwd(), 'themes'),
        "configFile": "theme.json"
      }
    });

    db.newTable('themes', {
      "id": {"type": "increments", "nullable": false, "primary": true},
      "name": {"type": "string", "maxlength": 150, "nullable": false, "unique": true},
      "folder": {"type": "string", "nullable": false},
      "active": {"type": "boolean", "nullable": false, "defaultTo": false}
    });

    this.collectThemes(config.get.themes.themesFolder).then(deferred.resolve);
    return promise;
  }

  collectThemes(base) {
    let deferred = Promise.defer(),
        promise = deferred.promise;

    let folders = fs.readdirSync(base),
        Themes = db.table('themes');

    Themes.where({}).then((themes)=> {
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

        if(!_.pathExists(configPath)) {
          console.log('no config');return;
        }

        let themeConfig = fs.readJSONSync(configPath);
        Themes.insert({
          "name": themeConfig.name,
          "folder": folder
        }).then();
      }

      deferred.resolve();
    });

    return promise;
  }

  activateTheme(theme) {

  }
}

module.exports = Themes;
