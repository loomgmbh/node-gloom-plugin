const Path = require('path');
const FS = require('fs');
const Gulp = require('gulp');

const Task = require('./Task');

module.exports = class GloomPlugin {

  static findRoot() {
    let root = process.cwd();
    while (true) {
      if (FS.existsSync(Path.join(root, 'gulpfile.js'))) {
        return root;
      }
      if (root === Path.join(root, '..')) return null;
      root = Path.join(root, '..');
    }
  }

  constructor(path, configs = {}) {
    this._path = path;
    this._configs = configs;
    this._plugins = null;
    this._cwd = GloomPlugin.findRoot();
  }

  get config() {
    return this._configs;
  }

  path(...args) {
    return Path.join(this._cwd, ...args);
  }

  getPath() {
    if (Path.isAbsolute(this._path)) {
      return this._path;
    }
    return Path.join(process.cwd(), this._path);
  }

  /**
   * @param {string} name 
   * @returns {Task}
   */
  getPlugin(name) {
    return this._plugins[name] || null;
  }

  load() {
    if (this._plugins !== null) return;
    this._plugins = {};
    if (this.config.loadPlugins && Array.isArray(this.config.loadPlugins)) {
      for (const plugin of this.config.loadPlugins) {
        this.loadPlugins(plugin);
      }
    }
    this.loadDirectory(this.getPath());
    return this;
  }

  loadDirectory(path) {
    if (!FS.existsSync(path)) return;
    const list = FS.readdirSync(path);

    for (const file of list) {
      const Subject = require(Path.join(path, file));
      
      if (Subject.prototype instanceof Task) {
        const plugin = new Subject(path);

        if (this.config.excludePlugins && this.config.excludePlugins.includes(plugin.key())) {
          console.log('Exclude plugin ' + this._plugins[plugin.key()].id());
          continue;
        }
        if (this._plugins[plugin.key()] !== undefined) {
          console.log('Overwrite ' + this._plugins[plugin.key()].id() + ' with ' + plugin.id());
        }
        this._plugins[plugin.key()] = plugin;
        if (this.config.tags && this.config.tags[plugin.key()]) {
          plugin.setTags(this.config.tags[plugin.key()]);
        }
      }
    }
  }

  loadPlugins(plugin) {
    let path = null;
    try {
      path = require.resolve(plugin + '/tasks');
    } catch (e) {
      console.error('Module "' + plugin + '" should be load for tasks but has no root "tasks" directory or is not installed.');
    }
    if (path !== null) {
      this.loadDirectory(path);
    }
  }

  init() {
    this.load();
    for (const name of (this.config.initOrder || [])) {
      this.getPlugin(name).init(this);
    }
    return this.initRemaining();
  }

  initRemaining() {
    for (const name in this._plugins) {
      this.getPlugin(name).init(this);
    }
    return this;
  }

  getTaggedPlugins(tags) {
    const plugins = {};

    for (const name in this._plugins) {
      const plugin = this.getPlugin(name);

      for (const tag of tags) {
        if (plugin.hasTag(tag)) {
          plugins[plugin.key()] = plugin;
          break;
        }
      }
    }
    return plugins;
  }

  findTask(fullTask, min = 1) {
    const splits = fullTask.split(':');
    do {
      if (Gulp.task(splits.join(':')) !== undefined) return splits.join(':');
      splits.pop();
    } while (splits.length >= min);
    return null;
  }

}
