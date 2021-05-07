const GloomPlugin = require('gloom-plugin');
const Gulp = require('gulp');

const manager = new GloomPlugin('./gulp/tasks', require('./gulp/config.json'));
manager.init();

Gulp.task('default', Gulp.parallel(manager.config.defaultTasks));