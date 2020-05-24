const { getClassName } = require('./classUtil');
const { getClassContent } = require('./classUtil');
const { getClassFieldsMethods } = require('../classAnalysis/classUtil');

const { parseFunction } = require('../functionAnalysis/functionParser');
const { postParseFunction } = require('../functionAnalysis/functionParser');

exports.parseClass = function(imports, mainClass) {
    
    var className = getClassName(mainClass);
    var classContent = getClassContent(mainClass);
  
    var [ classFields, classMethods ] = getClassFieldsMethods(classContent, imports);

    var functionsInfo = classMethods.map(classMethod => {
        return parseFunction(classMethod, classFields, imports);
    });

    functionsInfo = postParseFunction(functionsInfo);

    return {
        className,
        classFields,
        functionsInfo
    }
}