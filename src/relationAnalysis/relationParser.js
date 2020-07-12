const { filterMissingInfoClass } = require('./relationUtils');
const { filterExcludeClass } = require('./relationUtils');

exports.createRelationShip = function (classes) {
    classes = classes
        .filter(filterMissingInfoClass)
        .filter(filterExcludeClass)

    let functionRelation = classes
        .reduce(getFunctionRelationship, {});
    
    let interfaceRelation = classes
        .reduce(getInterfaceRelation, {});
    
    let abstractClassRelation = classes
        .reduce(getAbstractClassRelation, {});

    return {
        functionRelation,
        interfaceRelation,
        abstractClassRelation
    }
}

exports.findTree = function (relationMap, start) {

    console.log(`${getNodeName(start)}`);

    traverseTree(relationMap, start, 1);
}

function getFunctionRelationship(relationMap, clazz) {

    let package = clazz.package;
    let className = clazz.maniClassInfo.className;
    let functions = clazz.maniClassInfo.functionsInfo;
    
    return functions.reduce((relationMap, fun) => {
        let isAbstractFunction = fun.isAbstractFunction;
        let functionName = fun.functionName;
        let functionAccessLevel = fun.functionAccessLevel;
        
        let id = `${package}.${className}.${functionName}`;
        
        relationMap[id] = {
            metadata: {
                'id': id,
                'idShow': `${className}.${functionName}`,
                'accessLevel': functionAccessLevel,
                'isAbstractFunction': isAbstractFunction
            }
        };
        
        if (!isAbstractFunction) {
            fun.functionStatements
                .filter(statement => {
                    return typeof statement != 'string';
                })
                .forEach(statement => {
                    relationMap[id].relation = relationMap[id].relation || [];
                    relationMap[id].relationShort = relationMap[id].relationShort || [];
                    
                    relationMap[id].relation.push(statement.full);
                    relationMap[id].relationShort.push(statement.short);
                });
        }
        
        return relationMap;
    }, relationMap);
}

function getInterfaceRelation(relationMap, clazz) {

    let id = `${clazz.package}.${clazz.maniClassInfo.className}`;

    let isAbstract = clazz.maniClassInfo.isAbstract;
    let classType = clazz.maniClassInfo.classType;
    let classInterfaces = clazz.maniClassInfo.classInterfaces;
    
    // interface definition
    if (isAbstract && classType === 'interface') {
        relationMap[id] = [];
    }

    // implementation
    classInterfaces.forEach(classInterface => {
        relationMap[classInterface] = relationMap[classInterface] || [];
        relationMap[classInterface].push(id);
    });

    return relationMap;
}

function getAbstractClassRelation(relationMap, clazz) {
            
    let id = `${clazz.package}.${clazz.maniClassInfo.className}`;

    let isAbstract = clazz.maniClassInfo.isAbstract;
    let classType = clazz.maniClassInfo.classType;
    let classParent = clazz.maniClassInfo.classParent;

    // interface definition
    if (isAbstract && classType === 'class') {
        relationMap[id] = [];
    }

    if (classParent) {
        relationMap[classParent] = relationMap[classParent] || [];
        relationMap[classParent].push(id);
    }

    return relationMap;
}

function traverseTree(relationMap, start, deep) {

    var functionRelation = relationMap.functionRelation;
    var classRelation = {...relationMap.interfaceRelation, ...relationMap.abstractClassRelation};

    var currentNode = functionRelation[start] || {};
    var currentFunctionRelation = currentNode.relation || [];

    currentFunctionRelation.forEach(next => {
        var lastDot = next.lastIndexOf('.');
        var className = next.substring(0, lastDot); 
        var functionName = next.substring(lastDot); 

        var implementations = classRelation[className] || [];
        implementations.unshift(className);
        
        implementations = implementations
            .map(impl => impl + functionName)
            .filter(impl => {
                return functionRelation[impl] &&
                    !functionRelation[impl]['metadata']['isAbstractFunction']
            });

        if (implementations.length == 0) {
            console.log(`${' '.repeat(deep * 4)}${getNodeName(next)}`);
            return ;
        }

        var multiImplIndicator = implementations.length > 1 ? '-' : '';

        implementations
            .forEach(impl => {
                console.log(`${' '.repeat(deep * 4)}${multiImplIndicator}${getNodeName(impl)}`);
                
                traverseTree(relationMap, impl, deep + 1);
            });
    });
}

function getNodeName(fullName) {
    let nameParts = fullName.split('.');
    let n = nameParts.length;

    return `${nameParts[n-2]}.${nameParts[n-1]}`;
}