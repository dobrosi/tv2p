package com.github.dobrosi.tv2p.configuration;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Component;

@ConditionalOnProperty(prefix = "spring", name = "cache.type", havingValue = "redis")
@Configuration
@Component
@Import({ RedisAutoConfiguration.class })
public class RedisConfiguration {
}
