const fs = require('fs').promises;

const { getFiles } = require('./util/fileUtil');
const { filterProcessingFile } = require('./util/fileUtil');
const { logObjectWithPrettyFormat } = require('./util/logUtil');
const { logClassBreif } = require('./util/logUtil');

const { parseFile } = require('./fileAnalysis/fileParser');

const inputRoot = './resources';
const outputRoot = './output';

const start = async function () {

    const files = await getFiles(inputRoot);

    files
        .filter(filterProcessingFile)
        .forEach(processFile);
}

const processFile = async function (file) {
    try {
        var data = await fs.readFile(file, 'utf8');
        var classInfo = parseFile(data); 

        // logObjectWithPrettyFormat(classInfo);
        // logClassBreif(classInfo, file);
        
        if (classInfo && classInfo.maniClassInfo && classInfo.maniClassInfo.className) {
            var filename = `${classInfo.package.replace('com.amazon.marketplacelabelaccountingmanagementservice.', '')}.${classInfo.maniClassInfo.className}`
            await fs.writeFile(`${outputRoot}/${filename}.json`, JSON.stringify(classInfo, null, 4));
        }
    } catch (error) {
        console.log(`pasering ${file} fail with error: ${error}`);
        console.log(error.stack);
    }
}

start();
