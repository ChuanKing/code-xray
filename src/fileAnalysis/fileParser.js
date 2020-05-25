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

    var package = getPackage(content);
    var imports = getImports(content);
    var mainClass = extractClass(content)[0];

    var maniClassInfo = parseClass(package, imports, mainClass);

    return {
        package,
        imports,
        maniClassInfo
    }
}
