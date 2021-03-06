const { cleanStatement } = require("./statementUtil");
const { isUnsupportStatement } = require("./statementUtil");
const { parseStatementOutput } = require("./statementUtil");
const { getStatementSignature } = require("./statementUtil");
const { getStatementInput } = require("./statementUtil");

// TODO: statement in statement
// TODO: statement chain
// TODO: stream
exports.parseStatement = function (statement, parameters, imports) {

    if (isUnsupportStatement(statement)) return;

    statement = cleanStatement(statement);
    statement = parseStatementOutput(statement, imports, parameters);
    
    let statementSignature = getStatementSignature(statement, parameters, imports);
    let statementInput = getStatementInput(statement);

    return statementSignature;
}