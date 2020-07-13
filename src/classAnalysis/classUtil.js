const { jumpToEnd } = require('../util/util');
const { cleanGenerics } = require('../util/cleanUtil');

exports.getClassSignature = function (mainClass) {
    let start = 0;
    let end = mainClass.indexOf('{');
    
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

    let start = classSignature.indexOf('implements');
    start = (start == -1) ? classSignature.length: start;
    
    let implements = classSignature
        .substring(start)
        .replace('implements', '')
        .split('extends')[0]
        .trim();

    implements = cleanGenerics(implements)
    
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

    let start = classSignature.indexOf('extends');
    start = (start == -1) ? classSignature.length: start;
    
    let parent = classSignature
        .substring(start)
        .replace('extends', '')
        .split('implements')[0]
        .trim();

    return imports[parent] || parent
}

exports.getClassContent = function (mainClass) {
    let start = mainClass.indexOf('{');
    let end = mainClass.lastIndexOf('}');
    return mainClass.substring(start + 1, end);
}

exports.getClassFieldsMethods = function (classType, content, imports) {
    
    switch (classType) {
        case 'enum': return getEnumValues(content);
    
        default: return getDefaultClassFieldsMethods(content, imports);
    }
}

function getDefaultClassFieldsMethods(content, imports){
    let classFields = {};
    let classMethods = [];

    while (content.trim().length > 0) {
        let bracesLoc = content.indexOf('{');
        let semiLoc = content.indexOf(';');
        
        bracesLoc = (bracesLoc == -1) ? content.length + 1 : bracesLoc;
        semiLoc = (semiLoc == -1) ? content.length + 1 : semiLoc;
        
        // concrete function 
        if (bracesLoc < semiLoc) {
            let start = content.indexOf('{');
            let end = jumpToEnd(content, start, '{', '}');
            let method = content.substring(0, end).trim();
            
            content = content.substring(end);
            classMethods.push(method);
        }

        else {
            
            let end = semiLoc + 1;
            let signature = content.substring(0, end).trim();
            

            let parenthesesLoc = signature.indexOf('(');
            let equalLoc = signature.indexOf('=');

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
                let [fieldClass, fieldName] = signature.split(' ');

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