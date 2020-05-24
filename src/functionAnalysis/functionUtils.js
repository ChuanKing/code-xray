exports.getFunctionAccessLevel = function (classMethod) {

    var funSignature = getFucnctionSignature(classMethod);
    
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

exports.getFunctionOutputType = function(funSignature, imports) {
    
    var start = 0;
    var end = funSignature.indexOf('(');
    var funSignature = funSignature.substring(start, end).trim();

    var typeName = removeAccessIdentifier(funSignature).split(' ')[0];

    return {
        name: typeName,
        fullName: imports[typeName] || typeName
    };
}

exports.getFunctionName = function(funSignature) {
    
    var start = 0;
    var end = funSignature.indexOf('(');
    var funSignature = funSignature.substring(start, end).trim();

    return removeAccessIdentifier(funSignature).split(' ')[1];
}

exports.getFunctionInput = function(funSignature, imports) {
    var firstParentheses = funSignature.indexOf('(') + 1;
    var lastParentheses = funSignature.indexOf(')');
    var inputList = funSignature
        .substring(firstParentheses, lastParentheses)
        .split(',');

    var inputs = {};
    
    inputList.forEach(input => {
        input = input
            .replace('final', '')
            .trim();
        
        var [type, name] = input.split(' ');
        
        inputs[name] = imports[type] || type
    });

    return inputs;
}

exports.getFunctionContent = function(fun) {
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

function getFucnctionSignature(classMethod) {
    var start = 0;
    var end = classMethod.indexOf('{');
    var funSignature = classMethod.substring(start, end);
    
    return funSignature
        .replace('\n', '')
        .replace(/\s\s+/g, ' ')
        .trim();
}

function removeAccessIdentifier(funSignature) {
    return funSignature
        .replace('public ', '')
        .replace('private ', '')
        .replace('protected ', '')
        .replace('static ', '')
        .replace(/final /g, '')
        .trim();
}

