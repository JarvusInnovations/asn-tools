var cluster = require('cluster'),
    asn = require('./asn'),
    fs = require('fs');

process.on('message', function(work) {
    var data;

    if (work && work.file) {
        data = require('./' + work.file);

        for (var item in data) {
            data[item] = asn.normalize(data[item]);
        }

        fs.writeFileSync('./output/' + work.file.substr(5).replace('_full', '_full_normalized'), JSON.stringify(data, null, "\t"));
        fs.writeFileSync('./output/' + work.file.substr(5).replace('_full', '_full_relationships.json'), JSON.stringify(asn.getRelationships(data), null, "\t"));

        process.send(Object.keys(data).length);
    }
});