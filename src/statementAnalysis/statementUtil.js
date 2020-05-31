const { excludeStatements } = require("../config.js");

const { log } = require("../util/logUtil");
const { jumpToEnd } = require("../util/util");
const { cleanGenerics } = require("../util/cleanUtil");

exports.cleanStatement = function (statement) {
    statement = statement.replace('return', '')
        .replace(/\s\s+/g, ' ')
        .replace(/\s+\./g, '.')
        .replace(/\.\s+/g, '.')
        .trim();
    
    return cleanGenerics(statement);
}

// TODO
exports.isUnsupportStatement = function (statement) {

    if (statement.indexOf('do ') >= 0 ||
        statement.indexOf('do{') >= 0 ||
        statement.indexOf('for ') >= 0 ||
        statement.indexOf('for (') >= 0 ||
        statement.indexOf('while ') >= 0 ||
        statement.indexOf('while (') >= 0 ||
        statement.indexOf('if ') >= 0 ||
        statement.indexOf('if (') >= 0 ||
        statement.indexOf('catch ') >= 0 ||
        statement.indexOf('catch (') >= 0 ||
        statement.indexOf('(') == -1) {
        
        log(statement)
        return true;
    }

    return false;
}

exports.isExcludeStatement = function (statement) {

    statementFullName = statement['full'] || statement;

    return excludeStatements.includes(statementFullName);
}

exports.getFunctionStatementBrief = function (statements) {
    return statements.map(statement => {
        if (typeof statement == 'string') {
            return statement;
        }
        return statement.short;
    })
}

exports.parseStatementOutput = function (statement, imports, parameters) {
    if (statement.indexOf('=') < 0) return statement;

    var output = statement.split('=')[0];
    
    var responseType = (output.indexOf(' ') >= 0) ? output.split(' ')[0].trim() : undefined;
    var responseName = (output.indexOf(' ') >= 0) ? output.split(' ')[1].trim() : output;
    
    responseType = imports[responseType] || responseType;
    responseName = responseName.trim();
    
    if (responseType) {
        parameters[responseName] = responseType;
    }

    return removeOutput(statement);
}

exports.getStatementSignature = function(statement, parameters, imports) {
    statement = removeOutput(statement);

    var signature = statement.split('(')[0];

    // call function in other class
    if (signature.indexOf('.') > 0) {

        var [object, functionName] = signature.split('.');
    
        var classFullName = parameters[object] || imports[object] || object;
        var classShortName = classFullName.split('.').pop();
    
        return {
            name: functionName,
            class: classFullName,
            full: `${classFullName}.${functionName}`,
            short: `${classShortName}.${functionName}`
        };
    }

    // call function in itself
    else {
        return signature;
    }
}

exports.getStatementInput = function(statement) {
    statement = removeOutput(statement);

    var start = statement.indexOf('(');
    var end = jumpToEnd(statement, start, '(', ')');

    return statement.substring(start + 1, end - 1);
}

function removeOutput(statement) {
    if (statement.indexOf('=') < 0) return statement.trim();
    return statement.split('=')[1].trim();
}