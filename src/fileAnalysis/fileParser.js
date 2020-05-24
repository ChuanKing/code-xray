const { getPackage } = require('./fileUtil');
const { getImports } = require('./fileUtil');
const { getMainClass } = require('./fileUtil');

const { parseClass } = require('../classAnalysis/classParser');

// TODO: interface
// TODO: abstract class
exports.parseFile = function (content) {

    var package = getPackage(content);
    var imports = getImports(content);
    var mainClass = getMainClass(content);

    var maniClassInfo = parseClass(package, imports, mainClass);

    return maniClassInfo
}
