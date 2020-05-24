const { getPackage } = require('./fileUtil');
const { getImports } = require('./fileUtil');
const { getMainClass } = require('./fileUtil');

const { classParser } = require('../classAnalysis/classParser');

// TODO: interface
// TODO: abstract class
exports.fileParser = function (content) {

    var package = getPackage(content);
    var imports = getImports(content);
    var mainClass = getMainClass(content);

    var maniClassInfo = classParser(package, imports, mainClass);

    return maniClassInfo
}
