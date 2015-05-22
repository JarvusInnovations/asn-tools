function normalizeStructure() {
    console.log('happy face');
}

function normalizeValues() {

}

function normalize(obj) {
    return normalizeValues(normalizeStructure(obj));
}

function getPropertyCount(items) {
    var allProps = {};

    for (var item in items) {
        for (var prop in items[item]) {
            allProps[prop] = allProps[prop] || 0;
            allProps[prop]++;
        }
    }

    return allProps;
}

module.exports = {
    normalizeStructure: normalizeStructure,
    normalizeValues: normalizeValues,
    normalize: normalize,
    getPropertyCount: getPropertyCount
};