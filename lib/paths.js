const path = require('path');

const cwd = process.cwd();
const workDir = path.basename(cwd);
const vendorsDirs = [
  path.join(cwd, 'vendor', 'silverorange'),
  path.join(cwd, 'vendor', 'hippoeducation')
];
const packagesDir = path.join(cwd, 'www', 'packages');

module.exports = {
  cwd,
  work: workDir,
  vendors: vendorsDirs,
  packages: packagesDir,
  composerLock: 'composer.lock',
  less: [
    'www/styles/*.less',
    'www/styles/*/*.less',
    'www/packages/*/styles/*.less',
  ],
  php: [
    'include/*.php',
    'include/**/*.php',
    'system/**/*.php',
    'newsletter/**/*.php',
    'www/*.php',
    'www/admin/*.php',
  ],
  min: 'www/min',
  compiled: 'www/compiled',
  minified: 'www/min',
  compiledFlag: 'www/.concentrate-compiled',
  minifiedFlag: 'www/.concentrate-minified',
  combinedFlag: 'www/.concentrate-combined',
};
