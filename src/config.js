exports.shouldLog = false;

exports.includeFileTypes = [
    'java'
];

exports.excludeFiles = [
    'package-info.java'
];

// statementUtil.js
exports.unSupportStatements = ['do', 'for', 'while', 'if'];

exports.excludeStatements = [
    'log.info',
    'log.error'
];

exports.excludeRelationPackage = [
    'com.amazon.marketplacelabelaccountingmanagementservice.domainmodel',
    'com.amazon.merchantshippingorchestratorservice.external.lexs.function'
];

