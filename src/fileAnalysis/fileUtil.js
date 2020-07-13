const { jumpToEnd } = require('../util/util');

exports.getPackage = function (data) {
    let start = data.indexOf('package');
    let end = data.indexOf(';', start);
    return data.substring(start + 7, end).trim();
}

exports.getImports = function (data) {
    let imports = {};
    let start = -1;
    let end = -1;
    do {
        start = data.indexOf('import', end);
        end = data.indexOf(';', start);
        if (start != -1) {
            let dependencyFullName = data.substring(start + 6, end).trim();
            if (dependencyFullName.indexOf(' ') > -1) {
                dependencyFullName = dependencyFullName.split(' ')[1];
            }
            let dependencyShortName = dependencyFullName.split('.').slice(-1)[0];
            imports[dependencyShortName] = dependencyFullName;
        }
    } while (start != -1);
    return imports;
}

// Deprecated
exports.getMainClass = function (data) {
    let start = data.indexOf('public class');
    let end = findTheEnd(data, start);
    return data.substring(start, end);
}

exports.extractClass = function(data) {

    let classes = [];

    while (data.length > 0) {
        if (data.indexOf('{') == -1) break;

        let classLocation = data.indexOf('class ');
        let enumLocation = data.indexOf('enum ');
        let interfacLocation = data.indexOf('interface ');

        classLocation = (classLocation == -1) ? data.length: classLocation;
        enumLocation = (enumLocation == -1) ? data.length: enumLocation;
        interfacLocation = (interfacLocation == -1) ? data.length: interfacLocation;

        let identifierLocation = Math.min(classLocation, interfacLocation, enumLocation);
        
        let start = findTheStart(data, identifierLocation);
        let end = findTheEnd(data, identifierLocation);

        let classString = data.substring(start, end).trim();
        classes.push(classString);
        data = data.substring(end).trim();
    }

    return classes;
}

function findTheStart(data, start) {
    for (; start >= 0 && data.charAt(start) != ';'; start--) ;
    return start + 1;
}


function findTheEnd(data, start) {
    for (; start < data.length && data.charAt(start) != '{'; start++) ;
    return jumpToEnd(data, start, '{', '}');
}
