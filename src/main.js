const fs = require('fs').promises;

const { getFiles } = require('./util/fileUtil');
const { saveInfo } = require('./util/fileUtil');
const { filterProcessingFile } = require('./util/fileUtil');
const { logObjectWithPrettyFormat } = require('./util/logUtil');
const { logClassBreif } = require('./util/logUtil');

const { parseFile } = require('./fileAnalysis/fileParser');
const { createRelationShip } = require('./relationAnalysis/relationParser');
const { findTree } = require('./relationAnalysis/relationParser');

const inputRoot = process.argv[2];
const startPoint = process.argv[3];
const outputRoot = process.argv.length >= 5 ? process.argv[4]: undefined;
const isDebug = process.argv.length >= 6 ? process.argv[5]: false;

const start = async function () {

    const files = await getFiles(inputRoot);

    const classInfoList = await Promise.all(
        files
            .filter(filterProcessingFile)
            .map(processFile)
    );

    const relationship = createRelationShip(classInfoList);
    findTree(relationship, startPoint);

    if (!isDebug && outputRoot) {
        saveInfo(classInfoList, `${outputRoot}/classInfoList.json`);
        saveInfo(relationship, `${outputRoot}/relationship.json`);
    }

}

const processFile = async function (file) {
    try {
        let data = await fs.readFile(file, 'utf8');
        let classInfo = parseFile(data); 

        if (isDebug) {
            logObjectWithPrettyFormat(classInfo);
            logClassBreif(classInfo, file);
        }

        return classInfo;
    } catch (error) {
        console.log(`pasering ${file} fail with error: ${error}`);
        console.log(error.stack);
    }
}

start();