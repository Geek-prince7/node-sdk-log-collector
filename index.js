// Logger SDK for Node.js
// Author: Prince Dubey
// License: ISC

const getNetworkMetadata = require("./network_meta");
const getServerMetadata = require("./server_meta");


// Logger Entry point
// Logger constructor - accepts access token , validate access token (api call to check token valid or not returns accountId), fetch configurations (like interval time and batch size)
// apply configs batch size and interval time.
// make queues to store logs, metrics, traces.
// make upload function to upload logs, metrics, traces.
// empty the queue post update.
// Add middle ware function to handle incoming request, response ,duration
// Add error handling
//Apply traces and spans to each logs before pushing it to queue
// override console.log, console.error, console.warn etc to add in queue
// add meta data with each log like event_time, ip, region all necessary meta data

// push logs to Queue
//Similar processing for metrics
// Similar processing for traces



// API CALLS FOR UPLOADING LOGS,METRICS,TRACES
//LOG QUEUE
//METRIC QUEUE
//TRACE QUEUE
//BATCH PROCESSING - INTERVAL PROCESSING


class DexterLogger {
    static URLS = {
        VALIDATE_ACCESS_TOKEN: "/validateAccessToken",
        FETCH_CONFIGURATIONS: "/fetchConfigurations",
        UPLOAD_LOGS: "/uploadLogs",
        UPLOAD_METRICS: "/uploadMetrics",
        UPLOAD_TRACES: "/uploadTraces",
    }
    constructor(accessToken, serviceName) {
        this.HOST = "http://localhost:3000";
        if (!is_string(accessToken)) {
            throw new Error("Access token must be a string");
        }
        if (!is_string(serviceName)) {
            throw new Error("Service name must be a string");
        }
        this.accessToken = accessToken;
        this.serviceName = serviceName;
        this.serverMeta = getServerMetadata();
        this.validateAccessToken();
        this.fetchConfigurations();
        this.applyConfigurations();
        this.initializeQueues();
        this.initializeUploadFunction();
        this.initializeMiddleware();
        this.initializeErrorHandling();
        this.initializeTraces();
        this.initializeConsoleOverrides();
        this.initializeMetaData();

    }

    async validateAccessToken() {
        const response = await fetch(`${this.HOST}${DexterLogger.URLS.VALIDATE_ACCESS_TOKEN}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: this.accessToken }),
        });
        const data = await this.checkResonse(response);
        if (!data.valid) {
            throw new Error("Invalid access token");
        }
        this.accountId = data.accountId;
    }

    async fetchConfigurations() {
        const response = await fetch(`${this.HOST}${DexterLogger.URLS.FETCH_CONFIGURATIONS}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: this.accessToken }),
        });
        const data = await this.checkResonse(response);
        if (!data.valid) {
            throw new Error("Invalid access token");
        }
        this.configurations = data.configurations;
    }

    async applyConfigurations() {
        this.batchSize = this.configurations.batchSize;
        this.intervalTime = this.configurations.intervalTime;
        this.anonymizeKeys = this.configurations.anonymizeKeys;
        this.validateIntervalTime();
        this.intervalTimer = this.cronUploadLogs();
    }

    async validateIntervalTime() {
        if (this.intervalTime < 1000) {
            throw new Error("Interval time must be greater than 1000");
        }
    }

    async initializeQueues() {
        this.logQueue = [];
        this.metricQueue = [];
        this.traceQueue = [];

        this.requests = new HashMap();
        this.responses = new HashMap();
    }

    async initializeUploadFunction() {
        this.uploadLogs = this.uploadLogs.bind(this);
        this.uploadMetrics = this.uploadMetrics.bind(this);
        this.uploadTraces = this.uploadTraces.bind(this);
    }

    async initializeMiddleware() {
        this.middleware = this.middleware.bind(this);
    }

    async initializeErrorHandling() {
        this.errorHandler = this.errorHandler.bind(this);
    }

    async initializeTraces() {
        this.traces = this.traces.bind(this);
    }

    async initializeConsoleOverrides() {
        this.consoleOverrides = this.consoleOverrides.bind(this);
    }

    async initializeMetaData() {
        this.metaData = this.metaData.bind(this);
    }

    async uploadLogs() {
        if (this.logQueue.length >= this.batchSize) {
            this.uploadLogsToServer();
        }
    }

    async cronUploadLogs() {
        console.log("Cron Upload Logs Invoked");
        const interval = setInterval(() => {
            this.uploadLogsToServer();
        }, this.intervalTime);
        return interval;
    }

    async uploadLogsToServer() {
        console.log("Uploading Logs To Server...");
        const response = fetch(`${this.HOST}${DexterLogger.URLS.UPLOAD_LOGS}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ accessToken: this.accessToken, logs: this.logQueue, accountId: this.accountId }),
        });
        const data = await this.checkResonse(response);
        if (!data.valid) {
            throw new Error("Invalid access token");
        }
        if (data.success) {
            this.logQueue = [];
            this.requests.clear();
            this.responses.clear();
        }
    }

    async uploadMetrics() {

    }

    async uploadTraces() {

    }

    async requestMiddleware(req, res, next) {
        console.log("Request Middleware Invoked");
        req.traceId = req.headers.traceparent ?? this.generateTraceId();
        req.spanId = this.generateSpanId();
        let context = {
            traceId: req.traceId,
            spanId: req.spanId,
            serviceName: this.serviceName,
            startTime: new Date(),
            duration: 0,
            request: {
                body: req.body,
                headers: req.headers,
                query: req.query,
                params: req.params,
                path: req.path,
                route: req.route,
                method: req.method,
            },
            ip: this.getClientIp(req),
            region: req.region,
            accountId: this.accountId,
            serverMeta: this.serverMeta,
            networkMeta: this.getNetworkMetadata(req),

            //other meta data

            // request: req,
            // response: res,
            // type: 'rq'
        }

        this.requests.set(req.traceId, context);
        next();
    }

    async responseMiddleware(req, res, next) {
        let context = this.requests.get(req.traceId);
        context.duration = new Date() - context.startTime;
        context.response = {
            body: res.body,
            // headers: res.headers,
            status: res.status,
            statusText: res.statusText,
            length: res.length,
            type: res.type,


        }
        this.responses.set(req.traceId, context);
        this.logQueue.push(context);
        this.uploadLogs();
        next();
    }

    getNetworkMetadata(req) {
        return getNetworkMetadata(req)
    }
    getClientIp(req) {
        return (
            req.headers["x-client-ip"] ||
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.headers["x-real-ip"] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.connection?.socket?.remoteAddress ||
            null
        );
    }


    async responseMiddleware(req, res, next) {

    }

    async errorHandler() {

    }

    async traces() {

    }

    async consoleOverrides() {

    }

    async metaData() {

    }

    async checkResonse(response) {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        if (response.status !== 200) {
            await response.json().then((data) => {
                data.valid = false;
                return data;
            });
        }
        return await response.json();
    }

}

module.exports = DexterLogger;