const { jumpToEnd } = require('../util/util');

exports.getPackage = function (data) {
    var start = data.indexOf('package');
    var end = data.indexOf(';', start);
    return data.substring(start + 7, end).trim();
}

exports.getImports = function (data) {
    var imports = {};
    var start = -1;
    var end = -1;
    do {
        start = data.indexOf('import', end);
        end = data.indexOf(';', start);
        if (start != -1) {
            var dependencyFullName = data.substring(start + 6, end).trim();
            if (dependencyFullName.indexOf(' ') > -1) {
                dependencyFullName = dependencyFullName.split(' ')[1];
            }
            var dependencyShortName = dependencyFullName.split('.').slice(-1)[0];
            imports[dependencyShortName] = dependencyFullName;
        }
    } while (start != -1);
    return imports;
}

// Deprecated
exports.getMainClass = function (data) {
    var start = data.indexOf('public class');
    var end = findTheEnd(data, start);
    return data.substring(start, end);
}

exports.extractClass = function(data) {

    var classes = [];

    while (data.length > 0) {
        if (data.indexOf('{') == -1) break;

        var classLocation = data.indexOf('class ');
        var enumLocation = data.indexOf('enum ');
        var interfacLocation = data.indexOf('interface ');

        classLocation = (classLocation == -1) ? data.length: classLocation;
        enumLocation = (enumLocation == -1) ? data.length: enumLocation;
        interfacLocation = (interfacLocation == -1) ? data.length: interfacLocation;

        var identifierLocation = Math.min(classLocation, interfacLocation, enumLocation);
        
        var start = findTheStart(data, identifierLocation);
        var end = findTheEnd(data, identifierLocation);

        var classString = data.substring(start, end).trim();
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
