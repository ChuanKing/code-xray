const { shouldLog } = require("../config.js");

exports.log = function(msg, overrideShouldLog) {

    var finalShouldLog = overrideShouldLog || shouldLog;

    if (finalShouldLog && msg.length > 0) {
        console.log(msg);
    }
}

exports.logClassBreif = function(classInfo, file) {

    if (classInfo && 
        classInfo.maniClassInfo && 
        classInfo.maniClassInfo.functionsInfo && 
        classInfo.maniClassInfo.functionsInfo[0]) {
        
        exports.log('' + classInfo.maniClassInfo.className, true);
        
        classInfo.maniClassInfo.functionsInfo[0].functionStatementBrief.forEach(brief => {
            exports.log('    ' + brief, true);
        })
    } else {
        // console.log(`no info: ${file}`);
    }
}

exports.logObjectWithPrettyFormat = function(classInfo) {

    exports.log(JSON.stringify(classInfo, null, 4), true);

}

