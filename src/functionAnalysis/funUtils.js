const { getFunctionAccessLevel } = require('./funSignature');
const { getFunctionName } = require('./funSignature');
const { getFunctionInput } = require('./funSignature');
const { getFunctionOutputType } = require('./funSignature');

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

function getFunctionContent(fun) {
    var firstBrace = fun.indexOf('{');
    var lastBrace = fun.lastIndexOf('}');

    fun = fun.substring(firstBrace + 1, lastBrace);
    fun = fun.replace('/n', '').replace(/\s\s+/g, ' ');
    
    var lines = [];

    while (fun.length > 0) {
        fun = fun.trim();
        
        var semicolon = fun.indexOf(';');
        var forwardBrace = fun.indexOf('{');
        var backwardBrace = fun.indexOf('}');
        
        semicolon = (semicolon < 0) ? fun.length + 1: semicolon;
        forwardBrace = (forwardBrace < 0) ? fun.length + 1: forwardBrace;
        backwardBrace = (backwardBrace < 0) ? fun.length + 1: backwardBrace;

        var end = Math.min(semicolon, forwardBrace, backwardBrace) + 1;
        
        lines.push(fun.substring(0, end).trim());
        fun = fun.substring(end);
    }
    
    return lines;
}