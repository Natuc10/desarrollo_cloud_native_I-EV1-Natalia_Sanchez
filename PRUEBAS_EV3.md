# Hoja de evidencia — completar con resultados reales

| Prueba | Comando/acción | Resultado esperado | Resultado observado y captura |
|---|---|---|---|
| Cluster | `docker exec pedidos360-rabbitmq-1 rabbitmqctl cluster_status` | 3 nodos running | pendiente |
| Publicación | BFF `POST /api/orders/events` con JWT | 202 Accepted | pendiente |
| ACK | RabbitMQ UI publica `ORD-001|OK|Demo` | Logs ACK | pendiente |
| Reintentos | RabbitMQ UI publica `ORD-002|TEMPORAL|Demo` | 2 NACK y 1 ACK | pendiente |
| DLQ | RabbitMQ UI publica `ORD-003|PERMANENTE|Demo` | DLQ tiene 1 mensaje adicional | pendiente |
| Admin REST | POST queues/exchanges/bindings | 201 | pendiente |
| Validación | POST queues con nombre `no-valido` | 400 | pendiente |
| Caída de nodo | docker stop nodo 2 | 2 nodos continúan | pendiente |
| Recuperación | docker start nodo 2 | 3 nodos running | pendiente |
| Build | Maven verify de los tres | BUILD SUCCESS | pendiente |
