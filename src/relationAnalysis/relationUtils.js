const { excludeRelationPackage } = require('../config');

exports.filterMissingInfoClass = function(clazz) {
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

exports.filterExcludeClass = function(clazz) {
    var isInclude = true;
            
    excludeRelationPackage.forEach(package => {
        if (clazz.package.indexOf(package) >= 0) {
            isInclude = false;
        }
    })
    
    return isInclude;
}