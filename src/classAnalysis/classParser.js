const { getClassSignature } = require('./classUtil');
const { getClassAccessLevel } = require('./classUtil');
const { checkAbstract } = require('./classUtil');
const { getClassType } = require('./classUtil');
const { getClassName } = require('./classUtil');
const { getClassInterfaces } = require('./classUtil');
const { getClassParent } = require('./classUtil');
const { getClassContent } = require('./classUtil');
const { getClassFieldsMethods } = require('../classAnalysis/classUtil');

const { parseFunction } = require('../functionAnalysis/functionParser');
const { postParseFunction } = require('../functionAnalysis/functionParser');

exports.parseClass = function(package, imports, mainClass) {
    
    var classSignature = getClassSignature(mainClass);
    var classAccessLevel = getClassAccessLevel(classSignature);
    var isAbstract = checkAbstract(classSignature);
    var classType = getClassType(classSignature);
    var className = getClassName(classSignature);
    var classInterfaces = getClassInterfaces(classSignature, imports);
    var classParent = getClassParent(classSignature, imports);

    var classContent = getClassContent(mainClass);
  
    var [ classFields, classMethods ] = getClassFieldsMethods(classType, classContent, imports);

    var functionsInfo = classMethods.map(classMethod => {
        return parseFunction(classMethod, classFields, imports);
    });

    functionsInfo = postParseFunction(package, className, functionsInfo);

    return {
        className,
        classAccessLevel,
        isAbstract,
        classType,
        classInterfaces,
        classParent,
        classFields,
        functionsInfo
    }
}