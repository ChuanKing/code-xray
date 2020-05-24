exports.parseStatementOutput = function parseStatementOutput(line, imports, parameters) {
    var output = line.split('=')[0];
    
    var responseType = (output.indexOf(' ') >= 0) ? output.split(' ')[0].trim() : undefined;
    var responseName = (output.indexOf(' ') >= 0) ? output.split(' ')[1].trim() : output;
    
    responseType = imports[responseType] || responseType;
    responseName = responseName.trim();
    
    if (responseType) {
        parameters[responseName] = responseType;
    }
}
