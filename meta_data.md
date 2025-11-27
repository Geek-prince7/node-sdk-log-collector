Server meta Data
| Field               | Example          |
| ------------------- | ---------------- |
| `hostname`          | ip-10-0-0-5      |
| `service_name`      | checkout-service |
| `service_version`   | 1.3.2            |
| `environment`       | prod/dev/staging |
| `container_id`      | docker ID        |
| `k8s_pod`           | pod-name         |
| `k8s_node`          | node-name        |
| `region`            | us-east-1        |
| `availability_zone` | us-east-1b       |

Network Meta Data

| Field               | Example              |
| ------------------- | -------------------- |
| `connection_reused` | true                 |
| `tls_version`       | TLS 1.3              |
| `cipher_suite`      | ECDHE-RSA-AES128-GCM |
| `peer_ip`           | 54.212.1.11          |
| `peer_port`         | 443                  |

Response Meta Data

| Field              | Example         |
| ------------------ | --------------- |
| `status_code`      | 200 / 400 / 500 |
| `response_size`    | 2334 bytes      |
| `response_time_ms` | 42              |
| `compression`      | gzip/br         |

Request Meta Data

| Field               | Example        |
| ------------------- | -------------- |
| `browser_name`      | Chrome         |
| `browser_version`   | 122            |
| `os_name`           | Windows        |
| `os_version`        | 11             |
| `device_type`       | Desktop/Mobile |
| `screen_resolution` | 1920×1080      |

Geo Meta Data

| Field     | Example       |
| --------- | ------------- |
| `ip`      | `122.45.11.2` |
| `country` | `IN`          |
| `region`  | `Maharashtra` |
| `city`    | `Mumbai`      |
| `asn`     | 45678         |
| `isp`     | Airtel        |


