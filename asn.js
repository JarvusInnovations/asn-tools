var url = require('url'),
    propertyMap = {
    "http://xmlns.com/foaf/0.1/primaryTopic": "primaryTopic",
    "http://purl.org/dc/terms/rightsHolder": "rightsHolder",
    "http://purl.org/dc/terms/modified": "modified",
    "http://purl.org/dc/terms/created": "created",
    "http://creativecommons.org/ns#license": "license",
    "http://creativecommons.org/ns#attributionURL": "attributionURL",
    "http://creativecommons.org/ns#attributionName": "attributionName",
    "http://purl.org/ASN/schema/core/exportVersion": "exportVersion",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "type",
    "http://purl.org/ASN/schema/core/jurisdiction": "jurisdiction",
    "http://purl.org/dc/elements/1.1/title": "title",
    "http://purl.org/dc/terms/description": "description",
    "http://purl.org/dc/terms/source": "source",
    "http://purl.org/ASN/schema/core/publicationStatus": "publicationStatus",
    "http://purl.org/ASN/schema/core/repositoryDate": "repositoryDate",
    "http://purl.org/dc/terms/valid": "valid",
    "http://purl.org/dc/terms/tableOfContents": "tableOfContents",
    "http://purl.org/dc/terms/subject": "subject",
    "http://purl.org/dc/terms/educationLevel": "educationLevel",
    "http://purl.org/dc/terms/language": "language",
    "http://purl.org/gem/qualifiers/hasChild": "hasChild",
    "http://purl.org/dc/terms/isPartOf": "isPartOf",
    "http://purl.org/ASN/schema/core/authorityStatus": "authorityStatus",
    "http://purl.org/ASN/schema/core/indexingStatus": "indexingStatus",
    "http://purl.org/ASN/schema/core/listID": "listID",
    "http://purl.org/ASN/schema/core/statementLabel": "statementLabel",
    "http://purl.org/gem/qualifiers/isChildOf": "isChildOf",
    "http://purl.org/ASN/schema/core/statementNotation": "statementNotation",
    "http://purl.org/ASN/schema/core/comment": "comment",
    "http://purl.org/dc/elements/1.1/publisher": "publisher",
    "http://purl.org/ASN/schema/core/conceptKeyword": "conceptKeyword",
    "http://www.loc.gov/loc.terms/relators/aut": "author",
    "http://purl.org/dc/terms/dateCopyright": "dateCopyright",
    "http://purl.org/ASN/schema/core/localSubject": "localSubject",
    "http://www.w3.org/2004/02/skos/core#note": "note",
    "http://purl.org/dc/terms/rights": "rights",
    "http://purl.org/dc/terms/creator": "creator",
    "http://www.w3.org/2004/02/skos/core#exactMatch": "exactMatch",
    "http://purl.org/ASN/schema/core/conceptTerm": "conceptTerm",
    "http://purl.org/ASN/schema/core/comprisedOf": "comprisedOf",
    "http://purl.org/ASN/schema/core/alignTo": "alignTo",
    "http://purl.org/dc/terms/isVersionOf": "isVersionOf",
    "http://purl.org/ASN/schema/core/altStatementNotation": "altStatementNotation",
    "http://purl.org/dc/elements/1.1/creator": "creator",
    "http://purl.org/dc/terms/license": "license",
    "http://purl.org/ASN/schema/core/identifier": "identifier",
    "http://purl.org/ASN/schema/core/derivedFrom": "derivedFrom",
    "http://www.w3.org/2000/01/rdf-schema#seeAlso": "seeAlso"
    },

    arrayProperties = {
        "http://purl.org/dc/terms/educationLevel":        true,
        "http://purl.org/gem/qualifiers/hasChild":        true,
        "http://purl.org/dc/terms/subject":               true,
        "http://purl.org/dc/elements/1.1/title":          true,
        "http://purl.org/dc/terms/description":           true,
        "http://purl.org/dc/terms/language":              true,
        "http://purl.org/ASN/schema/core/statementLabel": true,
        "http://www.loc.gov/loc.terms/relators/aut":      true,
        "http://purl.org/ASN/schema/core/comment":        true,
        "http://purl.org/ASN/schema/core/localSubject":   true,
        "http://purl.org/ASN/schema/core/comprisedOf":    true,
        "http://purl.org/ASN/schema/core/alignTo":        true,
        "http://purl.org/ASN/schema/core/conceptTerm":    true,
        "http://purl.org/ASN/schema/core/conceptKeyword": true,
        "http://www.w3.org/2000/01/rdf-schema#seeAlso":   true,
        "http://purl.org/dc/elements/1.1/publisher":      true,
        "http://www.w3.org/2004/02/skos/core#exactMatch": true
    },

    relationshipPropertiesNormalized = {
        "hasChild": "parentTo",
        "author": "authoredBy",
        "exactMatch": "exactlyMatches",
        "alignTo": "alignsTo",
        "comprisedOf": "comprises",
        "seeAlso": "seeAlso"
    };

function parseValues(rawData, property) {
    var returnVal = rawData.map(function(rawEntry) {
        switch (rawEntry.type) {
            case 'literal':
                switch (rawEntry.datatype) {
                    case 'http://www.w3.org/2001/XMLSchema#date':
                        return new Date(rawEntry.value);
                    case 'http://www.w3.org/2001/XMLSchema#string':
                        return rawEntry.value;
                    case 'http://purl.org/dc/terms/W3CDTF':
                        return new Date(rawEntry.value);
                    default:
                        if (typeof rawEntry.datatype !== 'undefined') {
                            console.error('Unhandled datatype: ' + rawEntry.datatype);
                            console.log(rawEntry);
                            process.exit(1);
                        }

                        return rawEntry.value;
                }
            case 'uri':
                var parsedURL = url.parse(rawEntry.value);

                if (parsedURL.hostname === 'corestandards.org' || parsedURL.hostname === 'www.corestandards.org') {
                    return rawEntry.value.replace('http://corestandards.org/', '').replace(/\//g, '.');
                }

                if (rawEntry.value === 'http://id.loc.gov/vocabulary/iso639-2/eng') {
                    return 'english';
                }

                return rawEntry.value;

            default:
                console.error('Unhandled type: ' + rawEntry.type);
                console.log(rawEntry);
                process.exit(1);
        }

        return rawEntry.value;
    });

    if (arrayProperties[property]) {
        return returnVal;
    } else {
        return returnVal[0];
    }
}

function getValues(value) {
    if (Array.isArray(value)) {
        return value.map(function(item) {

            if (data[item.value]) {
                return data[item.value];
            }

            return item.value;
        })
    }

    return null;
}

function getValue(value) {
    if (Array.isArray(value)) {

        if (data[value[0].value]) {
            return data[value[0].value];
        }

        return value[0].value;
    }

    return null;
}

function normalizeProperties(obj) {
    var map = propertyMap,
        normalizedObj = {};

    for (var prop in obj) {
        if (!map[prop]) {
            console.warn('Ignoring unrecognized property: ' + prop);
        }

        normalizedObj[map[prop]] = obj[prop];
    }

    return normalizedObj;
}

function normalizeValues(obj) {
    for (var prop in obj) {
        obj[prop] = parseValues(obj[prop]);
    }

    return obj;
}

function normalize(obj) {
    return normalizeValues(normalizeProperties(obj));
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

function getArrayProperties(items) {
    var arrayProperties = {};

    for (var item in items) {
        for (var prop in items[item]) {
            if (items[item][prop].length > 1) {
              arrayProperties[prop] = true;
            }
        }
    }

    return arrayProperties;
}

function getPrettyProperties(items) {
    var allProps = {},
        prettyProps = {};

    for (var item in items) {
        for (var prop in items[item]) {
            allProps[prop] = allProps[prop] || 0;
            allProps[prop]++;
        }
    }

    for (var prop in allProps) {
        prettyProps[prop] = prop.split('/').pop().split('#').pop();
    }

    return prettyProps;
}

function getRelationships(data) {
    var relationships = [],
        relType,
        item,
        id,
        prop,
        val;

    for (id in data) {
        item = data[id];

        for (prop in item) {
            val = item[prop];
            relType = relationshipPropertiesNormalized[prop];

            if (relType) {
                if (!Array.isArray(val)) {
                    val = [val];
                }

                val.forEach(function(val) {
                    if (typeof val === 'string' && val.substr(0, 4) === 'http') {
                        relationships.push([id, relType, val]);
                    }
                });
            }
        }

    }

    return relationships;
}

module.exports = {
    normalizeProperties: normalizeProperties,
    normalizeValues: normalizeValues,
    normalize: normalize,
    getPropertyCount: getPropertyCount,
    getPrettyProperties: getPrettyProperties,
    getArrayProperties: getArrayProperties,
    getRelationships: getRelationships
};