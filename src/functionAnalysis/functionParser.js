const { getFunctionAccessLevel } = require("./functionUtils");
const { getFunctionOutputType } = require("./functionUtils");
const { getFunctionName } = require("./functionUtils");
const { getFunctionInput } = require("./functionUtils");
const { getFunctionContent } = require("./functionUtils");

const { parseStatement } = require("../statementAnalysis/statementParser");
const { isExcludeStatement } = require("../statementAnalysis/statementUtil");
const { getFunctionStatementBrief } = require("../statementAnalysis/statementUtil");

exports.parseFunction = function (classMethod, classFields, imports) {

    var functionAccessLevel = getFunctionAccessLevel(classMethod);
    var functionOutputType = getFunctionOutputType(classMethod, imports);
    var functionName = getFunctionName(classMethod);
    var functionInput = getFunctionInput(classMethod, imports);
    var functionContent = getFunctionContent(classMethod);    
    var functionStatements = getFunctionStatements(functionContent, functionInput, classFields, imports);

    return {
        functionAccessLevel,
        functionName,
        functionInput,
        functionOutputType,
        functionStatements
    };
}

exports.postParseFunction = function(functions) {

    var functionMap = functions.reduce((map, fun) => {
        map[fun.functionName] = fun;
        return map;
    }, {});

    functions = functions
        .filter(fun => {
            return fun.functionAccessLevel != 'private';
        })
        .map(fun => {
            fun.functionStatements = dfsStatement(fun.functionStatements, fun.functionName, functionMap);
            fun.functionStatementBrief = getFunctionStatementBrief(fun.functionStatements);
            return fun;
        });

    return functions;
}

function getFunctionStatements (functionContent, functionInput, classFields, imports) {

    var parameters = {...classFields, ...functionInput};
    
    return functionContent
        .map(statement => {
            return parseStatement(statement, parameters, imports);
        })
        .filter(statement => {
            return statement;
        });
}

function dfsStatement (functionStatements, functionName, functionMap) {

    functionStatements = functionStatements
        .map(statement => {
            
            if (typeof statement == 'string' && functionMap[statement] && statement != functionName) {
                var subFunctionStatements = functionMap[statement].functionStatements;
                var subFunctionName = functionMap[statement].functionName;
                
                return dfsStatement(subFunctionStatements, subFunctionName, functionMap);
            }

            if (statement == functionName) {
                return 'self';
            }

            return statement;
        })
        .filter(statement => {
            return !isExcludeStatement(statement);
        });

    return [].concat.apply([], functionStatements);
}