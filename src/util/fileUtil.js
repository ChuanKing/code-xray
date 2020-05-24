const { resolve } = require('path');
const { readdir } = require('fs').promises;

exports.getFiles = async function (dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? exports.getFiles(res) : res;
  }));
  
  return Array.prototype.concat(...files);
}

