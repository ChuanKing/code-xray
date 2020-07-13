const fs = require('fs').promises;

const { getFiles } = require('./util/fileUtil');
const { saveClassInfo } = require('./util/fileUtil');
const { filterProcessingFile } = require('./util/fileUtil');
const { logObjectWithPrettyFormat } = require('./util/logUtil');
const { logClassBreif } = require('./util/logUtil');

const { parseFile } = require('./fileAnalysis/fileParser');
const { createRelationShip } = require('./relationAnalysis/relationParser');
const { findTree } = require('./relationAnalysis/relationParser');

const inputRoot = '/Volumes/Unix/workspace/MerchantShippingOrchestratorService/src/MerchantShippingOrchestratorService';
const outputRoot = './output';
const startPoint = 'com.amazon.merchantshippingorchestratorservice.controller.GetPreferredShippingServicesController.applySellerPreferences'

const start = async function () {

    const files = await getFiles(inputRoot);

    const classInfoList = await Promise.all(
        files
            .filter(filterProcessingFile)
            .map(processFile)
    );

    const relationship = createRelationShip(classInfoList);
    findTree(relationship, startPoint);
}

const processFile = async function (file) {
    try {
        let data = await fs.readFile(file, 'utf8');
        let classInfo = parseFile(data); 

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

// processFile(`${inputRoot}/com/amazon/marketplacelabelaccountingmanagementservice/utilities/ApolloOperationalConfigRetrievalUtil.java`)
