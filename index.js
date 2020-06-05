const Path = require('path');
const FS = require('fs');

module.exports = class GloomPlugin {

  constructor(path, configs = {}) {
    this._path = path;
    this._configs = configs;
    this._plugins = null;
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
      this._plugins[Path.basename(file)] = require(Path.join(base, file));
    }
    return this;
  }

  init() {
    this.load();
    for (const plugin in this._plugins) {
      if (typeof this._plugins[plugin] === 'function') {
        this._plugins[plugin](this._configs, this);
      }
    }
  }

}
