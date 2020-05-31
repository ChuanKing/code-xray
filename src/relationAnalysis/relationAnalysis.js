const { excludeRelationPackage } = require('../config');

exports.createRelationShip = function (classes) {
    
    return classes
        .filter(filterMissingInfoClass)
        .filter(ignoreInterface)
        .filter(filterExcludeClass)
        .reduce((relationMap, clazz) => {
            var package = clazz.package;
            var className = clazz.maniClassInfo.className;
            var functions = clazz.maniClassInfo.functionsInfo;
            
            return functions.reduce((relationMap, fun) => {
                var id = `${package}.${className}.${fun.functionName}`;

                relationMap[id] = {
                    'id': `${package}.${className}.${fun.functionName}`,
                    'idShort': `${className}.${fun.functionName}`,
                    'accessLevel': fun.functionAccessLevel,
                    'relation': [],
                    'relationShort': [] 
                };
                
                fun.functionStatements
                    .filter(statement => {
                        return typeof statement != 'string';
                    })
                    .forEach(statement => {
                        relationMap[id].relation.push(statement.full);
                        relationMap[id].relationShort.push(statement.short);
                    });
                
                return relationMap;
            }, relationMap);
        }, {});

}

exports.findTree = function (relation, start, deep) {
    
    var currentNode = relation[start];

    if (!currentNode) {
        return;
    }

    console.log(`${' '.repeat(deep * 4)}${currentNode.idShort}`);
    currentNode.relation.forEach(next => {
        exports.findTree(relation, next, deep + 1);
    });
}

function filterMissingInfoClass(clazz) {
    if (!clazz || 
        !clazz.package ||
        !clazz.maniClassInfo ||
        !clazz.maniClassInfo.className ||
        !clazz.maniClassInfo.functionsInfo
    ) {
        log(`cannot create relationship: `)
        log(clazz);
        return false;
    }

    return true;
}

function ignoreInterface(clazz) {
    return clazz.maniClassInfo.classType != 'interface'
}

function filterExcludeClass(clazz) {
    var isInclude = true;
            
    excludeRelationPackage.forEach(package => {
        if (clazz.package.indexOf(package) >= 0) {
            isInclude = false;
        }
    })
    
    return isInclude;
}