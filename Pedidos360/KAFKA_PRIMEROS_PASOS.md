# Pedidos360 - Kafka: etapa 1 (antes de la rúbrica)

Esta etapa configura **un broker Kafka local en KRaft** y **Kafbat Kafka UI**. RabbitMQ y la aplicación Pedidos360 existente no se modifican.

## Ejecutar en PowerShell

Desde la carpeta Pedidos360 del repositorio:

```powershell
cd D:\desarrollo_cloud_native_I-EV1-Natalia_Sanchez\Pedidos360
docker compose -f docker-compose.kafka.yml up -d
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Puertos de desarrollo:
- Kafka para Windows: `localhost:9092`.
- Kafka para otros contenedores en `pedidos360_kafka_net`: `kafka:19092`.
- Interfaz Kafka UI: http://localhost:8090 (el BFF utiliza 8080).

## Crear un topic con 3 particiones

```powershell
docker exec pedidos360-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --if-not-exists --topic pedidos360.orders.created --partitions 3 --replication-factor 1
```

Verificar:

```powershell
docker exec pedidos360-kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic pedidos360.orders.created
```

## Publicar un evento de prueba

```powershell
docker exec -it pedidos360-kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic pedidos360.orders.created
```

Escribir y presionar Enter:

```json
{"orderId":"ORD-K001","customerName":"Cliente Demo","total":5990,"status":"CREADO"}
```

Salir con Ctrl+C. Esto cierra solo el productor de consola.

## Consumir y observar offsets

```powershell
docker exec pedidos360-kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic pedidos360.orders.created --from-beginning --property print.partition=true --property print.offset=true --timeout-ms 10000
```

Puedes ver el topic y sus mensajes en http://localhost:8090.

## Apagar sin borrar datos

```powershell
docker compose -f docker-compose.kafka.yml down
```

No utilizar `down -v` porque elimina el volumen de datos de Kafka.

## Próximas etapas

- Productor Spring Boot con KafkaTemplate integrado al BFF sin quitar RabbitMQ.
- Consumidor `@KafkaListener` con consumer group, partición, offset y key.
- Pipeline Kafka Streams con eventos de pedidos, filtros y estadísticas.
- Validación, reintentos, DLT y registros.
- Retención, tuning y pruebas de carga moderadas para observar consumer lag.

**Alcance actual:** un broker local con factor de replicación 1, apropiado para empezar; no demuestra tolerancia a fallos de brokers. Un clúster de tres brokers se planteará si lo solicita la rúbrica.

**Seguridad:** PLAINTEXT y listeners locales únicamente para desarrollo. No utilizar esta configuración en producción.
