var fs = require('fs');

const { cleanComment } = require('./util/cleanUtil');
const { cleanAnnotation } = require('./util/cleanUtil');
const { cleanString } = require('./util/cleanUtil');

const { fileParser } = require('./fileAnalysis/fileParser');

fs.readFile('./resources/test.java', 'utf8', function (err, data) {

    data = cleanComment(data);
    data = cleanAnnotation(data);
    data = cleanString(data);
    
    var classInfo = fileParser(data);

});





