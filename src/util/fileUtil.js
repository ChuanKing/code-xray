const fs = require('fs');

const { resolve } = require('path');
const { readdir } = require('fs').promises;

const { includeFileTypes } = require('../config');
const { excludeFiles } = require('../config');

const { log } = require('./logUtil');

exports.getFiles = async function (dir) {
    const dirents = await readdir(dir, { withFileTypes: true });

    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? exports.getFiles(res) : res;
    }));

    return Array.prototype.concat(...files);
}

exports.saveInfo = async function (info, output) {
    await fs.writeFile(output, JSON.stringify(info, null, 4), () => {});
}

exports.filterProcessingFile = function (file) {
    let filename = file.split('/').pop();
    let fileType = file.split('.').pop();

    return includeFileTypes.includes(fileType) &&
           !excludeFiles.includes(filename)
}