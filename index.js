// Logger SDK for Node.js
// Author: Prince Dubey
// License: ISC


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
    constructor(accessToken) {
        this.HOST = "http://localhost:3000";
        if (!is_string(accessToken)) {
            throw new Error("Access token must be a string");
        }
        this.accessToken = accessToken;
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
        const data = await response.json();
        if (!data.valid) {
            throw new Error("Invalid access token");
        }
        this.accountId = data.accountId;
    }

}

module.exports = DexterLogger;