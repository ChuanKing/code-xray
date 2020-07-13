const { cleanComment } = require('../util/cleanUtil');
const { cleanAnnotation } = require('../util/cleanUtil');
const { cleanString } = require('../util/cleanUtil');

const { getPackage } = require('./fileUtil');
const { getImports } = require('./fileUtil');
const { extractClass } = require('./fileUtil');

const { parseClass } = require('../classAnalysis/classParser');

// TODO: abstract class
exports.parseFile = function (content) {

    content = cleanComment(content);
    content = cleanAnnotation(content);
    content = cleanString(content);

    let package = getPackage(content);
    let imports = getImports(content);
    let mainClass = extractClass(content)[0];

    let maniClassInfo = parseClass(package, imports, mainClass);

    return {
        package,
        imports,
        maniClassInfo
    }
}
