const { excludeRelationPackage } = require('../config');

exports.createRelationShip = function (classes) {
    
    var relationArray =classes
        .filter(filterMissingInfoClass)
        .filter(ignoreInterface)
        .filter(filterExcludeClass)
        .map(clazz => {
            var package = clazz.package;
            var className = clazz.maniClassInfo.className;
            var functions = clazz.maniClassInfo.functionsInfo;
            
            return functions.map(fun => {
                var functionName = fun.functionName;
                var functionStatements = fun.functionStatements;
                var id = `${package}.${className}.${functionName}`;

                var relationElement = {
                    'id': `${package}.${className}.${functionName}`,
                    'idShort': `${className}.${functionName}`,
                    'accessLevel': fun.functionAccessLevel,
                    'relation': [],
                    'relationShort': []
                };
                
                functionStatements
                    .filter(statement => {
                        return typeof statement != 'string';
                    })
                    .forEach(statement => {
                        relationElement.relation.push(statement.full);
                        relationElement.relationShort.push(statement.short);
                    });

                return relationElement;
            });
        });
    
    relationArray = [].concat.apply([], relationArray)
    
    return relationArray.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
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