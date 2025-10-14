package com.github.dobrosi.tv2p;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.ApplicationPidFileWriter;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
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
}
