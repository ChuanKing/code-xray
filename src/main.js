var fs = require('fs');

const { cleanComment } = require('./util/cleanUtil');
const { cleanAnnotation } = require('./util/cleanUtil');
const { cleanString } = require('./util/cleanUtil');
const { log } = require('./util/util');

const { parseFile: fileParser } = require('./fileAnalysis/fileParser');

const inputRoot = '';
const file = '';

fs.readFile(`${inputRoot}/${file}`, 'utf8', function (err, data) {

    if (err) {
        log(err.message);
        return;
    }

    data = cleanComment(data);
    data = cleanAnnotation(data);
    data = cleanString(data);
    
    var classInfo = fileParser(data);

});





