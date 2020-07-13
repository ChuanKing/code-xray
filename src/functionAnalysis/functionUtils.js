const { cleanGenerics } = require('../util/cleanUtil');

exports.getFunctionAccessLevel = function (classMethod) {

    let funSignature = getFucnctionSignature(classMethod);
    
    if (funSignature.indexOf('public') >= 0) {
        return 'public'
    }

    if (funSignature.indexOf('private') >= 0) {
        return 'private'
    }

    if (funSignature.indexOf('protected') >= 0) {
        return 'private'
    }

    return 'default';
}

exports.getFunctionOutputType = function(classMethod, imports) {
    
    let funSignature = getFucnctionSignature(classMethod);

    let start = 0;
    let end = funSignature.indexOf('(');
    funSignature = funSignature.substring(start, end).trim();

    let typeName = removeAccessIdentifier(funSignature).split(' ')[0];

    return {
        name: typeName,
        fullName: imports[typeName] || typeName
    };
}

exports.getFunctionName = function(classMethod) {
    
    let funSignature = getFucnctionSignature(classMethod);

    let start = 0;
    let end = funSignature.indexOf('(');
    funSignature = funSignature.substring(start, end).trim();

    return removeAccessIdentifier(funSignature).split(' ')[1];
}

exports.getFunctionInput = function(classMethod, imports) {
    let funSignature = getFucnctionSignature(classMethod);

    let firstParentheses = funSignature.indexOf('(') + 1;
    let lastParentheses = funSignature.indexOf(')');
    let input = funSignature.substring(firstParentheses, lastParentheses).trim();
    
    if (input.length == 0) {
        return {};
    }

    let inputs = {};
    
    input.split(',').forEach(input => {
        input = input
            .replace('final', '')
            .trim();
        
        let [type, name] = input.split(' ');
        
        inputs[name] = imports[type] || type
    });

    return inputs;
}

exports.getFunctionContent = function(fun) {
    let firstBrace = fun.indexOf('{');
    let lastBrace = fun.lastIndexOf('}');

    fun = fun.substring(firstBrace + 1, lastBrace);
    fun = fun.replace('/n', '').replace(/\s\s+/g, ' ');
    
    let lines = [];

    while (fun.length > 0) {
        fun = fun.trim();
        
        let semicolon = fun.indexOf(';');
        let forwardBrace = fun.indexOf('{');
        let backwardBrace = fun.indexOf('}');
        
        semicolon = (semicolon < 0) ? fun.length + 1: semicolon;
        forwardBrace = (forwardBrace < 0) ? fun.length + 1: forwardBrace;
        backwardBrace = (backwardBrace < 0) ? fun.length + 1: backwardBrace;

        let end = Math.min(semicolon, forwardBrace, backwardBrace) + 1;
        
        lines.push(fun.substring(0, end).trim());
        fun = fun.substring(end);
    }
    
    return lines;
}

function getFucnctionSignature(classMethod) {
    let start = 0;
    let end = classMethod.indexOf('{');
    end = (end == -1) ? classMethod.length : end;
    let funSignature = classMethod.substring(start, end);
    
    return cleanGenerics(funSignature
        .replace('\n', '')
        .replace(/\s\s+/g, ' ')
        .trim());
}

function removeAccessIdentifier(funSignature) {
    return funSignature
        .replace('public ', '')
        .replace('private ', '')
        .replace('protected ', '')
        .replace('abstract ', '')
        .replace('static ', '')
        .replace('synchronized ', '')
        .replace(/final /g, '')
        .trim();
}

