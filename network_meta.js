function getNetworkMetadata(req) {
    const ip = (
        req.headers["x-client-ip"] ||
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.headers["x-real-ip"] ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        null
    );

    const network = {
        client_ip: ip,
        forwarded_for: req.headers["x-forwarded-for"] || null,
        protocol: req.protocol || "http",
        host: req.headers.host || null,
        tls_version: req.socket?.getProtocol?.() || null,
        cipher: req.socket?.getCipher?.()?.name || null,
        peer_ip: req.socket?.remoteAddress || null,
        peer_port: req.socket?.remotePort || null
    };

    return network;
}

module.exports = getNetworkMetadata;
