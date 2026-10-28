package com.pedidos360.notificaciones.listener;

import com.pedidos360.notificaciones.config.RabbitNames;
import com.rabbitmq.client.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/** Procesador de eventos de pedidos. Modos OK, TEMPORAL y PERMANENTE para demostrar errores. */
@Component
public class OrderEventListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    @RabbitListener(queues = RabbitNames.ORDERS_QUEUE, ackMode = "MANUAL")
    public void procesar(Message message, Channel channel) throws IOException {
        long tag = message.getMessageProperties().getDeliveryTag();
        String payload = new String(message.getBody(), StandardCharsets.UTF_8);
        String[] campos = payload.split("\\|", 3);
        int intento = 1 + reentregas(message);
        try {
            if (campos.length != 3) {
                throw new IllegalArgumentException("Formato de mensaje inválido");
            }
            String modo = campos[1];
            log.info("Evento recibido pedido={} modo={} intento={}", campos[0], modo, intento);
            if ("PERMANENTE".equals(modo)) {
                throw new IllegalArgumentException("Error permanente simulado para pedido " + campos[0]);
            }
            if ("TEMPORAL".equals(modo) && intento <= 2) {
                throw new IllegalStateException("Fallo transitorio simulado, intento " + intento);
            }
            log.info("ACK pedido={} cliente={} procesado", campos[0], campos[2]);
            channel.basicAck(tag, false);
        } catch (IllegalArgumentException ex) {
            log.error("NACK definitivo: {}. RabbitMQ deriva a DLQ", ex.getMessage());
            channel.basicNack(tag, false, false);
        } catch (IllegalStateException ex) {
            if (intento < 3) {
                log.warn("Reintentando pedido (NACK requeue=true): {}", ex.getMessage());
                channel.basicNack(tag, false, true);
            } else {
                log.error("Intentos agotados; NACK a DLQ: {}", ex.getMessage());
                channel.basicNack(tag, false, false);
            }
        } catch (Exception ex) {
            log.error("Error no esperado: se envía a DLQ", ex);
            channel.basicNack(tag, false, false);
        }
    }

    private int reentregas(Message message) {
        Object value = message.getMessageProperties().getHeaders().get("x-delivery-count");
        return value instanceof Number number ? number.intValue() : 0;
    }
}
