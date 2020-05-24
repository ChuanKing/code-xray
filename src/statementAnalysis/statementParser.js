const { cleanStatement } = require("./statementUtil");
const { isSupportStatement } = require("./statementUtil");
const { parseStatementOutput } = require("./statementUtil");
const { getStatementSignature } = require("./statementUtil");
const { getStatementInput } = require("./statementUtil");

// TODO: statement in statement
// TODO: statement chain
// TODO: stream
exports.parseStatement = function (statement, parameters, imports) {

    if (isSupportStatement(statement)) return;

    statement = cleanStatement(statement);
    statement = parseStatementOutput(statement, imports, parameters);
    
    var statementSignature = getStatementSignature(statement, parameters, imports);
    var statementInput = getStatementInput(statement);

    return statementSignature;
}