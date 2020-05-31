const fs = require('fs').promises;

const { getFiles } = require('./util/fileUtil');
const { saveClassInfo } = require('./util/fileUtil');
const { filterProcessingFile } = require('./util/fileUtil');
const { logObjectWithPrettyFormat } = require('./util/logUtil');
const { logClassBreif } = require('./util/logUtil');

const { parseFile } = require('./fileAnalysis/fileParser');
const { createRelationShip } = require('./relationAnalysis/relationAnalysis');
const { findTree } = require('./relationAnalysis/relationAnalysis');

const inputRoot = '';
const outputRoot = './output';

const start = async function () {

    const files = await getFiles(inputRoot);

    const classInfoList = await Promise.all(
        files
            .filter(filterProcessingFile)
            .map(processFile)
    );
    
    const relationship = createRelationShip(classInfoList);
    console.log(JSON.stringify(relationship));
    // findTree(relationship, startPoint, 0);
}

const processFile = async function (file) {
    try {
        var data = await fs.readFile(file, 'utf8');
        var classInfo = parseFile(data); 

        // logObjectWithPrettyFormat(classInfo);
        // logClassBreif(classInfo, file);
        
        // saveClassInfo(classInfo, outputRoot)

        return classInfo;
    } catch (error) {
        console.log(`pasering ${file} fail with error: ${error}`);
        console.log(error.stack);
    }
}

start();
