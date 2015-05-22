var cluster = require('cluster'),
    asn = require('./asn');

process.on('message', function(work) {
    if (work) {
        var work = require('./' + work);
        process.send(asn.getPropertyCount(work));
    }
});