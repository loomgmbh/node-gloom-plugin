const Path = require('path');
const FS = require('fs');

module.exports = class GloomPlugin {

  constructor(path, configs = {}) {
    this._path = path;
    this._configs = configs;
    this._plugins = null;
    this._cwd = configs.cwd || process.cwd();
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

  getPlugin(name) {
    return this._plugins[name] || null;
  }

  load() {
    if (this._plugins !== null) return;
    this._plugins = {};
    const base = this.getPath();
    const list = FS.readdirSync(base);

    for (const file of list) {
      this._plugins[Path.basename(file)] = {
        loaded: false,
        func: require(Path.join(base, file))
      };
    }
    return this;
  }

  init(order) {
    this.load();
    for (const name of (order || [])) {
      this.initPlugin(name);
    }
    return this.initRemaining();
  }

  initPlugin(name) {
    if (this._plugins[name] && !this._plugins[name].loaded && typeof this._plugins[name].func === 'function') {
      this._plugins[name].loaded = true;
      this._plugins[name].func(this._configs, this);
    }
    return this;
  }

  initRemaining() {
    for (const plugin in this._plugins) {
      this.initPlugin(plugin);
    }
    return this;
  }

}
