package com.pedidos360.bff.messaging;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/** Los nombres de mensajería se obtienen de application.properties. */
@Configuration
public class RabbitPublishConfig {
    @Value("${pedidos360.rabbit.exchange:pedidos360.events}")
    private String exchange;
    @Value("${pedidos360.rabbit.routing-key:order.created}")
    private String routingKey;
    public String exchange() { return exchange; }
    public String routingKey() { return routingKey; }
}
