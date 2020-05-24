const { getClassName } = require('./classUtil');
const { getClassContent } = require('./classUtil');
const { getClassFieldsMethods } = require('../classAnalysis/classUtil');

const { parseFunction } = require('../functionAnalysis/functionParser');
const { getFunctionDependencies } = require('../functionAnalysis/functionParser');

exports.parseClass = function(package, imports, mainClass) {
    
    var className = getClassName(mainClass);
    var classContent = getClassContent(mainClass);
    
    var classFields = getClassFieldsMethods(classContent, imports)[0];
    var classMethods = getClassFieldsMethods(classContent, imports)[1];
    var functions = parseFunction(classMethods, imports);

    Object.values(functions).forEach(fun => {

        if (fun.functionAccessLevel != 'private') {
            var dependencies = getFunctionDependencies(fun, functions, imports, classFields);
            console.log(JSON.stringify(dependencies));
        }

    });
}