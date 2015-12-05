#!/usr/bin/env node
'use strict';

var fs = require('fs');
var marked = require('marked');
var path = require('path');
var _ = require('underscore');

var walkSync = function(dir, fileList, baseDir) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir),
      baseDir = baseDir || '';
  fileList = fileList || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      fileList = walkSync(dir + '/' + file, fileList, baseDir);
    }
    else {
      fileList.push((dir + '/' + file).replace(baseDir, ''));
    }
  });
  return fileList;
};

var files = walkSync(__dirname, [], __dirname);
files = files.filter(function (file) {
  return file.indexOf('/.git/') === -1 && file.indexOf('/node_modules/') === -1;
});
var jsonData = files.map((f) => {
  var obj = path.parse(f);
  obj.file = f;
  return obj;
}).map((obj) => {
  obj.group = obj.dir.split('/')[1];
  return obj;
});
var groups = _.pluck(jsonData,'dir');
groups = _.uniq(groups);
var byDir = _.groupBy(jsonData, 'dir');
var readme = `# audio-files

A collection of test audio files for my web audio projects.


## Links

- [Github Project](https://github.com/skratchdot/audio-files/)
- [Project Page](http://projects.skratchdot.com/audio-files/)


## Files`;

Object.keys(byDir).forEach(function (dir) {
  readme += `\n\n### Directory: ${dir}\n`;
  byDir[dir].forEach(function (obj) {
    var b = obj.base;
    var f = obj.file;
    readme += `\n- [${b}](http://projects.skratchdot.com/audio-files${f})`;
  });
});

fs.writeFileSync('./README.md', readme, 'utf-8');
fs.writeFileSync('./index.html', marked(readme), 'utf-8');
fs.writeFileSync('./data.json', JSON.stringify(jsonData, null, '  '), 'utf-8');
