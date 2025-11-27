const { performance, PerformanceObserver } = require("perf_hooks");

function getRuntimeMetadata() {
    const memory = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Event loop delay
    let eventLoopDelay = null;
    const obs = new PerformanceObserver((list) => {
        const entry = list.getEntries()[0];
        eventLoopDelay = entry.duration;
    });
    obs.observe({ entryTypes: ["eventLoopDelay"] });
    performance.nodeTiming;

    return {
        runtime: "nodejs",
        node_version: process.version,
        pid: process.pid,
        uptime_seconds: process.uptime(),

        memory_rss_mb: (memory.rss / 1024 / 1024).toFixed(2),
        memory_heap_used_mb: (memory.heapUsed / 1024 / 1024).toFixed(2),
        memory_heap_total_mb: (memory.heapTotal / 1024 / 1024).toFixed(2),

        cpu_user_ms: cpuUsage.user / 1000,
        cpu_system_ms: cpuUsage.system / 1000,

        event_loop_delay_ms: eventLoopDelay
    };
}

module.exports = getRuntimeMetadata;
