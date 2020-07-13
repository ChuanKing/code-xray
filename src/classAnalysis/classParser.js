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
    
    let classSignature = getClassSignature(mainClass);
    let classAccessLevel = getClassAccessLevel(classSignature);
    let isAbstract = checkAbstract(classSignature);
    let classType = getClassType(classSignature);
    let className = getClassName(classSignature);
    let classInterfaces = getClassInterfaces(classSignature, imports);
    let classParent = getClassParent(classSignature, imports);

    let classContent = getClassContent(mainClass);
  
    let [ classFields, classMethods ] = getClassFieldsMethods(classType, classContent, imports);

    let functionsInfo = classMethods.map(classMethod => {
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