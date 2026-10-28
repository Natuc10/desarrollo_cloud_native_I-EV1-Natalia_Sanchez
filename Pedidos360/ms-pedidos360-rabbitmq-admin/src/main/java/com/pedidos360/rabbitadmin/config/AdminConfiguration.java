package com.pedidos360.rabbitadmin.config;

import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminConfiguration {
    @Bean
    RabbitAdmin rabbitAdmin(ConnectionFactory factory) { return new RabbitAdmin(factory); }
}
