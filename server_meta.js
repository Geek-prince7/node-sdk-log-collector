const os = require("os");
const fs = require("fs");

function getServerMetadata() {
    const hostname = os.hostname();
    const platform = os.platform();
    const release = os.release();

    // Try to read container ID (Docker)
    let containerId = null;
    try {
        const cgroup = fs.readFileSync("/proc/self/cgroup", "utf8");
        const match = cgroup.match(/docker\/([a-f0-9]+)/);
        if (match) containerId = match[1];
    } catch { }

    // Kubernetes Metadata
    const k8s = {
        pod_name: process.env.HOSTNAME || null,
        namespace: process.env.KUBERNETES_NAMESPACE || null,
        node_name: process.env.KUBERNETES_NODE_NAME || null
    };

    return {
        hostname,
        os_platform: platform,
        os_version: release,
        service_name: process.env.SERVICE_NAME || "unknown-service",
        service_version: process.env.SERVICE_VERSION || null,
        environment: process.env.NODE_ENV || null,
        region: process.env.AWS_REGION || process.env.GCP_REGION || null,
        availability_zone: process.env.AWS_ZONE || null,
        container_id: containerId,
        k8s
    };
}

module.exports = getServerMetadata;
