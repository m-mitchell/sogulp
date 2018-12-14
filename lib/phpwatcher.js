const batch = require('gulp-batch');
const gutil = require('gulp-util');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const q = require('q');
const paths = require('./paths');
const phplint = require('./phplint');
const phpclassmap = require('./phpclassmap');

module.exports = {
  watch: function phpWatchTask() {
    const deferred = q.defer();

    const hasComposer = fs.existsSync(paths.composerLock);
    const watchPaths = paths.php.slice();

    // Chokidar can't glob symlink directories properly so explicitly list
    // each directory instead.
    if (hasComposer) {
      paths.vendors.forEach(vendorPath => {
        if (fs.existsSync(vendorPath)) {
          fs.readdirSync(vendorPath).forEach((dir) => {
            const vendorDir = path.join(vendorPath, dir);
            const stats = fs.lstatSync(vendorDir);
            if (stats.isSymbolicLink()) {
              watchPaths.push(path.join(vendorDir, '**', '*.php'));
            }
          });
        }
      });
    }

    const watcher = chokidar.watch(
      watchPaths,
      {
        // Ignore composer autoload files and backup silverorange composer
        // package directories.
        ignored: [
          /^vendor\/autoload.php$/,
          /^vendor\/composer\/.*\.php$/,
          /^vendor\/silverorange\/.*\.original\/.*\.php$/,
          /^vendor\/hippoeducation\/.*\.original\/.*\.php$/,
        ],
        persistent: true,
        followSymlinks: true,
      }
    );

    watcher.on('ready', () => {
      const buildClassMap = batch((events, complete) => {
        gutil.log(
          gutil.colors.gray('..'),
          gutil.colors.magenta('starting dump-autoload')
        );
        phpclassmap.task().then(() => {
          gutil.log(
            gutil.colors.gray('..'),
            gutil.colors.magenta('finished dump-autoload')
          );
          complete();
        });
      });

      function lint(pathToLint) {
        phplint.stream(pathToLint);
      }

      watcher
        .on('add', (addedPath) => lint(addedPath))
        .on('change', (changedPath) => lint(changedPath))
      ;

      if (hasComposer) {
        watcher
          .on('add', (addedPath) => buildClassMap(addedPath))
          .on('change', (changedPath) => buildClassMap(changedPath))
          .on('unlink', (unlinkedPath) => buildClassMap(unlinkedPath))
        ;
      }

      deferred.resolve();
    });

    return deferred.promise;
  },
};
