const { resolve } = require('path');
const { readdir } = require('fs').promises;

const { includeFileTypes } = require('../config');
const { excludeFiles } = require('../config');

exports.getFiles = async function (dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? exports.getFiles(res) : res;
  }));
  
  return Array.prototype.concat(...files);
}

exports.filterProcessingFile = function (file) {
  var filename = file.split('/').pop();
  var fileType = file.split('.').pop();

  return includeFileTypes.includes(fileType) && 
          !excludeFiles.includes(filename)
}