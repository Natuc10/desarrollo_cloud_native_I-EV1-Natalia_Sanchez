package com.pedidos360.notificaciones.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Topología declarada al iniciar el microservicio, separada del procesamiento. */
@Configuration
public class RabbitTopologyConfig {
    @Bean
    public DirectExchange ordersExchange() {
        return new DirectExchange(RabbitNames.ORDERS_EXCHANGE, true, false);
    }
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(RabbitNames.DLX_EXCHANGE, true, false);
    }
    @Bean
    public Queue ordersQueue() {
        return QueueBuilder.durable(RabbitNames.ORDERS_QUEUE)
                .quorum()
                .withArgument("x-delivery-limit", 5)
                .deadLetterExchange(RabbitNames.DLX_EXCHANGE)
                .deadLetterRoutingKey(RabbitNames.DLQ_ROUTING_KEY)
                .build();
    }
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(RabbitNames.DLQ_QUEUE).quorum().build();
    }
    @Bean
    public Binding ordersBinding(Queue ordersQueue, DirectExchange ordersExchange) {
        return BindingBuilder.bind(ordersQueue).to(ordersExchange).with(RabbitNames.ORDERS_ROUTING_KEY);
    }
    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(RabbitNames.DLQ_ROUTING_KEY);
    }
}
