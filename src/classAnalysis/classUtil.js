const { jumpToEnd } = require('../util/util');
const { cleanGenerics } = require('../util/cleanUtil');

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

    return classSignature.indexOf('abstract') >= 0 || 
        classSignature.indexOf('interface') >= 0;
}

exports.getClassType = function (classSignature) {

    // annotation
    // should before interface
    if (classSignature.indexOf('@interface') >= 0) {
        return '@interface'
    }

    if (classSignature.indexOf('interface') >= 0) {
        return 'interface'
    }

    if (classSignature.indexOf('class') >= 0) {
        return 'class'
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

exports.getClassInterfaces = function (classSignature, imports) {

    var start = classSignature.indexOf('implements');
    start = (start == -1) ? classSignature.length: start;
    
    var implements = classSignature
        .substring(start)
        .replace('implements', '')
        .split('extends')[0]
        .trim();

    var implements = cleanGenerics(implements)
    
    return implements
        .split(',')
        .map(implement => {
            implement = implement.trim();
            
            return imports[implement] || implement
        })
        .filter(implement => {
            return implement.length > 0;
        });
}

exports.getClassParent = function (classSignature, imports) {

    var start = classSignature.indexOf('extends');
    start = (start == -1) ? classSignature.length: start;
    
    var parent = classSignature
        .substring(start)
        .replace('extends', '')
        .split('implements')[0]
        .trim();

    return imports[parent] || parent
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
    var classMethods = [];

    while (content.trim().length > 0) {
        var bracesLoc = content.indexOf('{');
        var semiLoc = content.indexOf(';');
        
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

        else {
            
            var end = semiLoc + 1;
            var signature = content.substring(0, end).trim();
            

            var parenthesesLoc = signature.indexOf('(');
            var equalLoc = signature.indexOf('=');

            // abstract method
            if (parenthesesLoc >= 0 && equalLoc == -1) {
                classMethods.push(signature);
            }

            // class field
            else {
                signature = signature
                    .replace('public ', '')
                    .replace('private ', '')
                    .replace('static ', '')
                    .replace('final ', '')
                    .replace(';', '')
                    .trim();
                
                signature = cleanGenerics(signature);
                var [fieldClass, fieldName] = signature.split(' ');

                if (fieldClass && fieldName) {
                    classFields[fieldName.trim()] = imports[fieldClass.trim()] || fieldClass.trim();
                }
            }

            content = content.substring(end);
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