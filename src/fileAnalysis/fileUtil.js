const { jumpToEnd } = require('../util/util');

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

exports.getMainClass = function (data) {
    var start = data.indexOf('public class');
    var end = findTheEnd(data, start);
    return data.substring(start, end);
}

exports.getPackage = function (data) {
    var start = data.indexOf('package');
    var end = data.indexOf(';', start);
    return data.substring(start + 7, end).trim();
}

function findTheEnd(data, start) {
    for (; start < data.length && data.charAt(start) != '{'; start++) ;
    return jumpToEnd(data, start, '{', '}');
}
