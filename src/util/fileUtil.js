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

exports.saveClassInfo = async function (classInfo, outputRoot) {
    if (classInfo && classInfo.maniClassInfo && classInfo.maniClassInfo.className) {
        let filename = `${classInfo.package.replace('com.amazon.marketplacelabelaccountingmanagementservice.', '')}.${classInfo.maniClassInfo.className}`
        await fs.writeFile(`${outputRoot}/${filename}.json`, JSON.stringify(classInfo, null, 4), () => {});
    } else {
        log(`cannot save file`);
        log(`classInfo`);
    }
}

exports.filterProcessingFile = function (file) {
    let filename = file.split('/').pop();
    let fileType = file.split('.').pop();

    return includeFileTypes.includes(fileType) &&
           !excludeFiles.includes(filename)
}