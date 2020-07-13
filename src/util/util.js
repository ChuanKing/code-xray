exports.jumpToEnd = function (string, start, c1, c2) {
    let count = 1;
    start++;
    while (start < string.length && count > 0) {
        if (string.charAt(start) == '"') {
            start = exports.ignoreQuotes(string, start);
        }
        else if (string.charAt(start) == c1) {
            count++;
        }
        else if (string.charAt(start) == c2) {
            count--;
        }
        start++;
    }
    return start;
}

exports.ignoreQuotes = function ignoreQuotes(string, start) {
    start++;
    while (start < string.length && string.charAt(start) != '"') {
        while (string.charAt(start) == '\\') {            
            start++;
        }
        start++;
    }
    return start;
}

