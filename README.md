# Quick Install

Zum installieren führe folgenden Befehl aus:

`npm install https://github.com/loomgmbh/node-gloom-plugin.git`

# How to use

```js
const GloomPlugin = require('gloom-plugin');

const manager = new GloomPlugin('./tasks', require('./config.json'));
manager.init();
```
