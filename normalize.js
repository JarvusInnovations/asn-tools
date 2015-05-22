var fs      = require('fs'),
    cluster = require('cluster'),
    numCPUs = require('os').cpus().length,
    glob    = require('glob'),
    fileQueue,
    masterPropCount = {},
    relationships = {};

cluster.setupMaster({
    exec:   "normalize-worker.js",
    silent: false
});

console.log('ASN Normalization Utility');

glob('data/*_full.json', function (err, files) {
    console.log('Processing ' + files.length + ' standards files using ' + numCPUs + ' threads...');

    if (err) {
        throw err;
    }

    fileQueue = files;

    startCluster();
});

function processWork(work) {
    console.log(work + ' items processed...');
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
            var work = { file: fileQueue.pop() };

            if (typeof work.file === 'undefined') {
                child.disconnect();
            } else {
                child.send(work);
            }
        });

        child.send({ file: fileQueue.pop() });
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