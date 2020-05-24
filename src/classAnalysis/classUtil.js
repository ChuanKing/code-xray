const { jumpToEnd } = require('../util/util');

exports.getClassName = function (mainClass) {
    var start = mainClass.indexOf('class');
    var end = mainClass.indexOf('{', start);
    var classSignature = mainClass.substring(start, end);
    
    classSignature = classSignature
        .replace('public ', '')
        .replace('final ', '')
        .replace('abstract ', '')
        .replace('class ', '')
        .trim();
    
    return classSignature
        .split('implement')[0]
        .split('extend')[0]
        .trim();
}

exports.getClassContent = function (mainClass) {
    var start = mainClass.indexOf('{');
    var end = mainClass.lastIndexOf('}');
    return mainClass.substring(start + 1, end);
}

exports.getClassFieldsMethods = function (content, imports) {
    
    var classFields = {};
    var classMethods = [];

    while (content.trim().length > 0) {
        var quoteLoc = content.indexOf('{');
        var semiLoc = content.indexOf(';');
        
        quoteLoc = (quoteLoc == -1) ? content.length + 1 : quoteLoc;
        semiLoc = (semiLoc == -1) ? content.length + 1 : semiLoc;
        
        if (quoteLoc < semiLoc) {
            var start = content.indexOf('{');
            var end = jumpToEnd(content, start, '{', '}');
            var method = content.substring(0, end).trim();
            
            content = content.substring(end);
            classMethods.push(method);
        }
        else {
            var start = 0;
            var end = content.indexOf(';') + 1;
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

            classFields[fieldName.trim()] = imports[fieldClass.trim()] || fieldClass.trim();
        }
    }
    
    return [classFields, classMethods];
}

