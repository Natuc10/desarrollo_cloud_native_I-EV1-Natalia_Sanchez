# Evaluación Parcial 3 — RabbitMQ para Pedidos360

Código complementario para añadir al repositorio actual **sin borrar lo desarrollado en las EV anteriores**.

## Requisitos
- Docker Desktop funcionando.
- Java 21 (la misma versión configurada en el BFF del repositorio GitHub).
- Maven disponible (`mvn -version`) o Maven Wrapper (`mvnw.cmd`) existente en el BFF.
- Puertos: 5672-5674, 15672-15674, 8080 (BFF), 8086, 8087 libres.

## 1. Instalación en carpeta principal
Copiar el contenido de `Pedidos360/` de este ZIP dentro de la carpeta `Pedidos360/` real.
**No reemplazar el pom.xml ni application.properties del BFF**. Seguir `INTEGRAR_BFF.txt`.

## 2. Arrancar RabbitMQ de 3 nodos
Abrir PowerShell dentro de `Pedidos360/` y ejecutar:

```powershell
docker compose -f docker-compose.rabbitmq.yml up -d
docker compose -f docker-compose.rabbitmq.yml ps
docker exec pedidos360-rabbitmq-1 rabbitmqctl cluster_status
```

Verificar que están los tres nodos en `Running Nodes`.
Consolas de gestión: http://localhost:15672, http://localhost:15673 y http://localhost:15674
Credenciales exclusivas para DEMO LOCAL: `ev3admin` / `ev3_local_demo`.
**No exponer estos puertos ni contraseñas en producción.**

### Por qué 3 nodos
Las colas `pedidos360.orders` y `pedidos360.orders.dlq` son **quorum queues** replicadas en un clúster de 3 nodos. Las colas clásicas sin réplica NO demuestran tolerancia a fallas de un nodo.

## 3. Arrancar los microservicios
En terminales separadas de PowerShell:

```powershell
cd Pedidos360/ms-pedidos360-notificaciones
mvn spring-boot:run
```

```powershell
cd Pedidos360/ms-pedidos360-rabbitmq-admin
mvn spring-boot:run
```

En la tercera terminal, desde el BFF **después de integrarlo**:

```powershell
cd Pedidos360/ms-pedidos360-bff
.\mvnw.cmd spring-boot:run
```

**Nota**: cada bloque `cd` supone que empiezas en la carpeta raíz del repositorio.

## 4. Simular pedidos
El endpoint de eventos del BFF mantiene la protección JWT del proyecto:

```
POST http://localhost:8080/api/orders/events
Authorization: Bearer <TOKEN_REAL>
Content-Type: application/json

{"orderId":"ORD-001","customerName":"Cliente Demo","failureMode":"OK"}
```

Valores de `failureMode`:
- `OK`: procesamiento y ACK.
- `TEMPORAL`: los dos primeros intentos generan NACK y requeue; el tercero termina en ACK (x-delivery-count en quorum queue).
- `PERMANENTE`: NACK con requeue=false y publicación automática en DLQ.

Para probar sin login (sólo laboratorio local), publicar desde la interfaz de RabbitMQ (Exchanges -> `pedidos360.events` -> Publish message), con `routing key = order.created` y payload exacto `ORD-002|PERMANENTE|Cliente Prueba`.

Verificar en http://localhost:15672 -> Queues and Streams -> `pedidos360.orders.dlq` el mensaje retenido. La DLQ NO tiene consumidor automático, para permitir ver la evidencia en el panel.

Estado: http://localhost:8086/api/mensajeria/estado

## 5. API de administración REST (sólo localhost:8087)
```powershell
# Crear una cola
Invoke-RestMethod -Method Post -Uri 'http://localhost:8087/api/rabbitmq/queues' -ContentType 'application/json' -Body '{"name":"demo.alertas"}'

# Crear un exchange
Invoke-RestMethod -Method Post -Uri 'http://localhost:8087/api/rabbitmq/exchanges' -ContentType 'application/json' -Body '{"name":"demo.eventos"}'

# Crear binding
Invoke-RestMethod -Method Post -Uri 'http://localhost:8087/api/rabbitmq/bindings' -ContentType 'application/json' -Body '{"queue":"demo.alertas","exchange":"demo.eventos","routingKey":"alerta.critica"}'

# Eliminar binding
Invoke-RestMethod -Method Delete -Uri 'http://localhost:8087/api/rabbitmq/bindings' -ContentType 'application/json' -Body '{"queue":"demo.alertas","exchange":"demo.eventos","routingKey":"alerta.critica"}'

# Eliminar cola y exchange
Invoke-RestMethod -Method Delete -Uri 'http://localhost:8087/api/rabbitmq/queues/demo.alertas'
Invoke-RestMethod -Method Delete -Uri 'http://localhost:8087/api/rabbitmq/exchanges/demo.eventos'
```
Los nombres de recursos se validan y deben comenzar por `demo.` para proteger los recursos reales de Pedidos360.

## 5.b. Página opcional Angular (para mostrar la demo)

Si quieres que la funcionalidad también se vea en tu Angular, copia los 3 archivos dentro de
`OPCIONAL_FRONTEND_ANGULAR/src/app/pages/rabbitmq-ev3/` a
`Pedidos360/frontend-pedidos360/src/app/pages/rabbitmq-ev3/`.

En tu `app.routes.ts` agrega una ruta adaptada a tu guard existente:

```typescript
{
  path: 'rabbitmq-ev3',
  loadComponent: () => import('./pages/rabbitmq-ev3/rabbitmq-ev3')
    .then(m => m.RabbitmqEv3Component),
  // Aplica aquí el mismo canActivate que ya usas para tus rutas protegidas.
}
```

El HttpClient debe tener tu interceptor MSAL/JWT configurado, igual que tus otras llamadas al BFF.
Este componente es opcional y **no cambia las rutas existentes automáticamente**.

## 6. Simular caída de nodo (sin borrar datos)
Ejecutar (con los tres nodos funcionando):
```powershell
docker stop pedidos360-rabbitmq-2
docker exec pedidos360-rabbitmq-1 rabbitmqctl cluster_status
```
Seguir publicando mensajes. RabbitMQ debería continuar disponible con una mayoría (2/3).
Restaurar:
```powershell
docker start pedidos360-rabbitmq-2
docker exec pedidos360-rabbitmq-1 rabbitmqctl cluster_status
```
Evitar `docker compose down -v`, ya que elimina los volúmenes de datos.

## 7. Evidencias para la evaluación
1. `docker compose ... ps` con tres nodos ejecutándose.
2. `cluster_status` mostrando los tres nodos.
3. Consola RabbitMQ con los exchanges, las colas quorum y la DLQ.
4. Logs de `ms-pedidos360-notificaciones` mostrando ACK, reintentos y NACK definitivo.
5. Captura de la DLQ con mensajes fallidos retenidos.
6. Pruebas REST de creación/borrado de recursos `demo.*` y validación 400 al enviar un nombre inválido.
7. Captura de `docker stop pedidos360-rabbitmq-2` y servicio recuperado.
8. Compilación con `mvn clean verify` del BFF y los dos servicios añadidos.
9. Captura de Angular existente con login JWT y la operación normal del sistema para demostrar no regresión.

## 8. Cobertura de la rúbrica
- Nombres centralizados: `RabbitNames` y properties BFF.
- Beans: `RabbitTopologyConfig` declara exchange, queue y binding para pedidos y DLQ.
- Separación: controlador -> publisher (BFF) -> exchange; listener sólo procesa.
- Consumidores: `@RabbitListener`, agrupado por dominio `listener/`.
- ACK/NACK: `OrderEventListener`, modos OK/TEMPORAL/PERMANENTE.
- Microservicio administrador: `ms-pedidos360-rabbitmq-admin`.
- REST, servicios dedicados y validaciones: `AdminController`, `RabbitResourceManager`, `AdminErrorHandler`.

## Observaciones importantes
- Esta implementación se preparó a partir de la pauta recibida y del BFF publicado en GitHub. **No se han ejecutado Docker ni Maven en tu equipo**: valida los resultados reales antes de entregar.
- El frontend Angular y `ms-pedidos360-catalog`/`ms-pedidos360-orders` locales no están aún en la rama `main` de GitHub. Debes confirmar que los subiste antes de entregar.
- `OrderEventPublisher` es un punto de entrada demostrativo protegido por JWT; para integración de negocio real, invocarlo cuando se cree un pedido de verdad en `ms-pedidos360-orders`.
- Este despliegue es sólo de desarrollo local. No utilizar credenciales públicas de ejemplo fuera de localhost.
