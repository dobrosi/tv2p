package org.example.tv2p.configuration;

import java.io.IOException;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import redis.embedded.RedisServer;

@ConditionalOnProperty(prefix = "spring", name = "cache.type", havingValue = "redis")
@Configuration
@Import({ RedisAutoConfiguration.class })
public class RedisConfiguration {
    private final RedisServer redisServer;

    public RedisConfiguration(RedisProperties redisProperties) throws IOException {
        redisServer = new RedisServer(redisProperties.getPort());
    }

    @PostConstruct
    public void postConstruct() {
        redisServer.start();
    }

    @PreDestroy
    public void preDestroy() {
        redisServer.stop();
    }
}
