const fs = require('fs').promises;

const { includeFileTypes } = require('./config');
const { excludeFiles } = require('./config');
const { getFiles } = require('./util/fileUtil');
const { parseFile } = require('./fileAnalysis/fileParser');

const start = async function () {
    
    const inputRoot = '/Volumes/Unix/workspace/MarketplaceLabelAccountingManagementService/src/MarketplaceLabelAccountingManagementService/src';
    const files = await getFiles(inputRoot);

    files
        .filter(file => {
            var filename = file.split('/').pop();
            var fileType = file.split('.').pop();

            return includeFileTypes.includes(fileType) && 
                   !excludeFiles.includes(filename)
        })
        .forEach(async file => {
            try {
                var data = await fs.readFile(file, 'utf8');
                var classInfo = parseFile(data); 

                console.log(classInfo);
            } catch (error) {
                console.log(`pasering ${file} fail with error: ${error}`);
            }
        });
}

start();