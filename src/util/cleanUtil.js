const { jumpToEnd } = require('./util');
const { ignoreQuotes } = require('./util');

exports.cleanComment = function cleanComment(content) {
    
    content = cleanCommentType1(content);
    content = cleanCommentType2(content);

    return content;
}

exports.cleanAnnotation = function (content) {

    var start = -1;
    var end = -1;

    do {
        var start = content.indexOf('@');
        var end = start;

        for (; end < content.length && content.charAt(end) == ' '; end++) ;
        for (; end < content.length && RegExp(/^[a-zA-Z0-9@]+$/).test(content.charAt(end)); end++) ;

        if (content.charAt(end) == '(') {
            end = jumpToEnd(content, end, '(', ')');
        }

        content = content.slice(0, start) + content.slice(end);
    } while (start != -1);

    return content;
}

exports.cleanString = function (content) {
    
    var start = 0;

    while (start >= 0 && start < content.length) {

        var start = content.indexOf('"', start);
        var end = ignoreQuotes(content, start) + 1;
        
        if (start == -1) break;

        content = content.substring(0, start) + '""' + content.substring(end);

        start = start + 2; 
    }

    return content;
}

exports.cleanGenerics = function (content) {

    if (content.indexOf('<') === -1) {
        return content;
    }

    var start = content.indexOf('<');
    var end = jumpToEnd(content, start, '<', '>');

    return content.substring(0, start) + content.substring(end);
}

function cleanCommentType1(data) {
    /* clean this type */
    while (true) {
        var start = data.indexOf('/*');
        var end = data.indexOf('*/', start);
        if (start === -1) {
            break;
        }
        data = data.slice(0, start - 1) + data.slice(end + 2);
    }
    return data;
}

// TODO: improve
function cleanCommentType2(data) {
    // clean this type 
    var lines = data.split('\n');
    return lines.map(line => line.split('//')[0])
                .join('\n');
}