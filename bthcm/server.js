'use strict';

var app = require('./app');
var debug = require('debug')('service');
var logger = require('./lib/util/logger.js').Logger();
var serverConfig = require('config').serverConfig;

app.set('port', process.env.PORT || serverConfig.port);
// Include the cluster module
var cluster = require('cluster');
var cpuCount, server;
// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    cpuCount = serverConfig.workerCount === 0 ? require('os').cpus().length : serverConfig.workerCount;

    //cpuCount = require('os').cpus().length;
    logger.debug('CPU Count is : '+cpuCount, null, null, "debug");

    var setupWorker = function(worker) {
        worker.on('message', function(msg, object) {
            if (msg.toUpperCase() === "DISCONNECT") {
                worker.send('disconnect');
            }
        });
    }

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        setupWorker(cluster.fork());
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        logger.error("WORKER.DIED", { worker_id: worker.id, pid: worker.process.pid }, new Error('Worker ' + worker.id + ' died :('));
        setupWorker(cluster.fork());
    });

    // Code to run if we're in a worker process
} else {
    var worker = cluster.worker;
    server = app.listen(app.get('port'), function() {
        debug('Express server listening on port ' + server.address().port);
    });

    var numOpenRequests = 0;
    var sockets = [];
    var disconnect = false;
    var disconnected_time = null;

    /*
     * Worker Info used for logging
     */
    var genWorkerInfo = function() {
        return { worker_id: worker.id, pid: process.pid, open_requests: numOpenRequests, open_sockets: sockets.length, disconnected_time: disconnected_time };
    }

    logger.debug('WORKER.RUNNING', genWorkerInfo());

    /*
     * Keep track of sockets
     */
    server.on('connection', function(socket) {
        sockets.push(socket);
    });

    var closeSockets = function() {
        logger.debug("SOCKETS.CLOSE", genWorkerInfo())
        sockets.forEach(function(socket) { socket.end(); });
    }

    /*
     * Keep track of request count, close sockets when count reaches 0,
     * if we're trying to disconnect
     */
    server.on('request', function(request, response) {
        if (!response.headersSent) {
            if (disconnect) { response.setHeader("Connection", "close"); }
            numOpenRequests++;
            response.on('finish', function() {
                numOpenRequests--;
                if (disconnect) { logger.debug("DISCONNECTED.WORKER.RESPONSE", genWorkerInfo()); }
                // If this is the last open request, kill sockets, but allow some time for client to receive response
                // otherwise they'll get a socket hangup exception
                if (disconnect && numOpenRequests === 0) { setTimeout(function() { closeSockets() }, 3000); }
            });
        }
    });

    /*
     * Handle messages from master, which will tell us to disconnect
     * Make sure we don't call disconnect multiple times
     * Log each disconnect request
     */
    process.on('message', function(msg, object) {
        if (msg.toUpperCase() === "DISCONNECT") {
            var workerInfo = genWorkerInfo();
            if (disconnect) {
                workerInfo.repeat_disconnect_request = true;
            } else {
                server.close();
                worker.disconnect();
                disconnect = true;
                disconnected_time = new Date().getTime();
                timeout = setTimeout(function() { logger.debug("WORKER.FORCEKILL", workerInfo); worker.kill(); }, 45000);
                timeout.unref();
                worker.on('exit', function() {
                    logger.error("WORKER.DISCONNECTED", workerInfo, new Error('Worker ' + worker.id + ' disconnected :('));
                    clearTimeout(timeout);
                });
            }
            logger.debug("WORKER.DISCONNECT", genWorkerInfo());
            if (numOpenRequests <= 0 && sockets.length) { closeSockets(); }
        }
    })

    /*
     * If there is an uncaught exception we need to log it
     * We trigger worker.disconnect which will stop the work from receiving any more requests,
     * but will give the current requests 90 secs to finish, otherwise we kill the worker anyway
     */
    process.on('uncaughtException', function(err) {
        logger.error('PAYPORT.EXCEPTION.UNCAUGHT', genWorkerInfo(), err);
        process.send('disconnect');
    });
}