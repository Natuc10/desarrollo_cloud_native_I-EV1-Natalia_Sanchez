package com.pedidos360.bff.messaging;

import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/** Productor asíncrono, desacoplado del controlador. */
@Service
public class OrderEventPublisher {
    private final RabbitTemplate rabbitTemplate;
    private final RabbitPublishConfig config;
    public OrderEventPublisher(RabbitTemplate rabbitTemplate, RabbitPublishConfig config) {
        this.rabbitTemplate = rabbitTemplate;
        this.config = config;
    }
    public void publicar(String orderId, String cliente, String modo) {
        String payload = orderId + "|" + modo + "|" + cliente;
        rabbitTemplate.convertAndSend(config.exchange(), config.routingKey(), payload, message -> {
            message.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            return message;
        });
    }
}
