var fs      = require('fs'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    glob    = require('glob'),
    fileQueue,
    masterPropCount = {};

cluster.setupMaster({
    exec:   "normalize-worker.js",
    silent: false
});

console.log('ASN Normalization Utility');

glob('*_full.json', function (err, files) {
    console.log('Processing ' + files.length + ' standards files using ' + numCPUs + ' threads...');

    if (err) {
        throw err;
    }

    fileQueue = files;

    startCluster();
});

function processWork(work) {
    for (var prop in work) {
        masterPropCount[prop] = masterPropCount[prop] || 0;
        masterPropCount[prop] += work[prop];
    }
}

function startCluster() {
    console.log('Spawning ' + numCPUs + ' workers for processing...');

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {

        var child = cluster.workers[id];

        child.on('message', function (msg) {
            processWork(msg);
            var work = fileQueue.pop();

            if (typeof work === 'undefined') {
                child.disconnect();
            } else {
                child.send(work);
            }
        });

        child.send(fileQueue.pop());
    });

}

cluster.on('online', function (worker) {
    console.log('Worker #' + worker.id + ' came online');
});

cluster.on('exit', function (worker, code, signal) {
    if (Object.keys(cluster.workers).length === 0) {
        console.log('Work has halted, exiting now.');
        console.log(JSON.stringify(masterPropCount, null, "\t"));
        process.exit(0);
    }
});

cluster.on('disconnected', function (worker) {
    console.log('Worker #' + worker.id + ' disconnected');
});

process.on('exit', function () {
    cluster.disconnect();
});