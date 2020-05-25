const { jumpToEnd } = require('../util/util');

const { getFunctionOutputType } = require("../functionAnalysis/functionUtils");
const { getFunctionName } = require("../functionAnalysis/functionUtils");
const { getFunctionInput } = require("../functionAnalysis/functionUtils");

exports.getClassSignature = function (mainClass) {
    var start = 0;
    var end = mainClass.indexOf('{');
    
    return mainClass
        .substring(start, end)
        .replace('\n', '')
        .replace(/\s\s+/g, ' ')
        .trim();
}

exports.getClassAccessLevel = function (classSignature) {
    
    if (classSignature.indexOf('public') >= 0) {
        return 'public'
    }

    if (classSignature.indexOf('private') >= 0) {
        return 'private'
    }

    if (classSignature.indexOf('protected') >= 0) {
        return 'private'
    }

    return 'default';
}

exports.checkAbstract = function (classSignature) {

    return classSignature.indexOf('abstract') >= 0;
}

exports.getClassType = function (classSignature) {

    if (classSignature.indexOf('class') >= 0) {
        return 'class'
    }

    if (classSignature.indexOf('interface') >= 0) {
        return 'interface'
    }

    if (classSignature.indexOf('enum') >= 0) {
        return 'enum'
    }

    return 'UNKNOW';
}

// TODO: generic class
exports.getClassName = function (classSignature) {

    classSignature = classSignature
        .split('implements')[0]
        .split('extends')[0]
        .trim();

    return classSignature.split(' ').pop();
}

exports.getClassInterfaces = function (classSignature) {

    var start = classSignature.indexOf('implements');
    start = (start == -1) ? classSignature.length: start;
    
    var implements = classSignature
        .substring(start)
        .replace('implements', '')
        .split('extends')[0]
        .trim();

    return implements;
}

exports.getClassParent = function (classSignature) {

    var start = classSignature.indexOf('extends');
    start = (start == -1) ? classSignature.length: start;
    
    var parent = classSignature
        .substring(start)
        .replace('extends', '')
        .split('implements')[0]
        .trim();

    return parent;
}

exports.getClassContent = function (mainClass) {
    var start = mainClass.indexOf('{');
    var end = mainClass.lastIndexOf('}');
    return mainClass.substring(start + 1, end);
}

exports.getClassFieldsMethods = function (classType, content, imports) {
    
    switch (classType) {
        case 'enum': return getEnumValues(content);
    
        default: return getDefaultClassFieldsMethods(content, imports);
    }
}

function getDefaultClassFieldsMethods(content, imports){
    var classFields = {};
    var classAbstractMethods = [];
    var classMethods = [];

    while (content.trim().length > 0) {
        var bracesLoc = content.indexOf('{');
        var semiLoc = content.indexOf(';');
        var parenthesesLoc = content.indexOf('(');
        var equalLoc = content.indexOf('=');
        
        bracesLoc = (bracesLoc == -1) ? content.length + 1 : bracesLoc;
        semiLoc = (semiLoc == -1) ? content.length + 1 : semiLoc;
        
        // concrete function 
        if (bracesLoc < semiLoc) {
            var start = content.indexOf('{');
            var end = jumpToEnd(content, start, '{', '}');
            var method = content.substring(0, end).trim();
            
            content = content.substring(end);
            classMethods.push(method);
        }

        // abstract method
        // TODO: move to fucntion 
        else if (parenthesesLoc >= 0 && equalLoc == -1) {
            var end = semiLoc + 1;

            var classMethod = content.substring(0, end).trim();

            var functionOutputType = getFunctionOutputType(classMethod, imports);
            var functionName = getFunctionName(classMethod);
            var functionInput = getFunctionInput(classMethod, imports);

            classMethods.push(classMethod);

            content = content.substring(end);
        }

        // class field
        else {
            var start = 0;
            var end = semiLoc + 1;
            var field = content.substring(0, end).trim();
            
            content = content.substring(end);

            // TODO: abstract class and interface
            var [fieldClass, fieldName] = field
                .replace('public ', '')
                .replace('private ', '')
                .replace('static ', '')
                .replace('final ', '')
                .replace(';', '')
                .trim()
                .split(' ');

            if (fieldClass && fieldName) {
                classFields[fieldName.trim()] = imports[fieldClass.trim()] || fieldClass.trim();
            }
        }
    }
    
    return [classFields, classMethods];
}

function getEnumValues (content) {
    content = content
        .replace('\n', '')
        .replace(/\s\s+/g, ' ')
        .trim();

    return [content.split(','), []];
}