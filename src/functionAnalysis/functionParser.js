const { parseStatementOutput } = require("../statementAnalysis/parseStatementOutput");

const { getFunctionAccessLevel } = require("./functionUtils");
const { getFunctionOutputType } = require("./functionUtils");
const { getFunctionName } = require("./functionUtils");
const { getFunctionInput } = require("./functionUtils");
const { getFunctionContent } = require("./functionUtils");

exports.parseFunction = function (classMethods, imports) {

    var functions = {};
    
    classMethods.forEach(classMethod => {
        var functionAccessLevel = getFunctionAccessLevel(classMethod);
        var functionOutputType = getFunctionOutputType(classMethod, imports);
        var functionName = getFunctionName(classMethod);
        var functionInput = getFunctionInput(classMethod, imports);
        var funContent = getFunctionContent(classMethod);
        
        functions[functionName] = {
            functionAccessLevel,
            functionName,
            functionInput,
            functionOutputType,
            funContent
        };
    });

    return functions;
}

// TODO: private function
// TODO: stream
// TODO: function in function
// TODO: recursive
// TODO: exclude 
exports.getFunctionDependencies = function (fun, functions, imports, classFields) {

    var parameters = {...classFields, ...fun.functionInput};
    var statements = fun.funContent;
    var dependencies = [];

    statements.forEach(line => {
        
        line = line.replace('return', '')
            .replace(/\s\s+/g, ' ')
            .replace(/\s+\./g, '.')
            .replace(/\.\s+/g, '.')
            .trim();

        // TODO:
        if (line.indexOf('do') >= 0 || 
            line.indexOf('for') >= 0 || 
            line.indexOf('while') >= 0 || 
            line.indexOf('if') >= 0 || 
            line.indexOf('(') == -1) {
            
            // console.log(`ignore line: ${line}`);
            return;
        }

        // line has output
        if (line.indexOf('=') >= 0) {
            parseStatementOutput(line, imports, parameters);
            line = line.split('=')[1].trim();
        }

        // statement
        dependencies.push(exports.parseStatement(line, parameters, functions, imports, classFields));
    });

    // console.log(JSON.stringify(parameters));
    // console.log(JSON.stringify(statements));
    // console.log(JSON.stringify(dependencies));
    // console.log(JSON.stringify(functions)); 

    return [].concat.apply([], dependencies.filter(Boolean));
}

exports.parseStatement = function (line, parameters, functions, imports, classFields) {
    
    var dotLoc = line.indexOf('.');
    var quoteLoc = line.indexOf('(');
    
    // called function in other class
    if (dotLoc >= 0 && quoteLoc > dotLoc) {
    
        var object = line.split('.')[0];
        var functionName = line.substring(dotLoc + 1, quoteLoc);
    
        var classFullName = parameters[object] || imports[object] || object;
        var classShortName = classFullName.split('.').pop();
    
        return {
            name: functionName,
            class: classFullName,
            short: `${classShortName}.${functionName}`
        };
    }
    
    // called function in current class
    else if (quoteLoc >= 0) {
    
        var functionName = line.substring(0, quoteLoc).trim();
        
        if (functions[functionName]) {
            var fun = functions[functionName];
            return exports.getFunctionDependencies(fun, functions, imports, classFields)
        } else {
            // console.log(`ignore line: ${line}`);
        }
    }

    // others
    else {
        // console.log(`ignore line: ${line}`);
    }
}
