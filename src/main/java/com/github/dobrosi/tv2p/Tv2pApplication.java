package com.github.dobrosi.tv2p;

import java.time.Duration;

import com.github.dobrosi.tv2p.configuration.TmdbApiConfiguration;
import info.movito.themoviedbapi.TmdbApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.ApplicationPidFileWriter;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableConfigurationProperties
@ConfigurationPropertiesScan
@EnableCaching
@EnableScheduling
@Slf4j
public class Tv2pApplication {
    public static void main(String[] args) {
        SpringApplication application =
                new SpringApplication(Tv2pApplication.class);
        application.addListeners(new ApplicationPidFileWriter());
        application.run(args);
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration
                .defaultCacheConfig();

        return RedisCacheManager.builder(factory)
                .cacheDefaults(config)
                .withCacheConfiguration(
                        "videoUrl",
                        config.entryTtl(Duration.ofMinutes(30))
                )
                .build();
    }

    @Bean
    public TmdbApi tmdbApi(TmdbApiConfiguration config) {
        return new TmdbApi(config.getApiKey());
    }
}
