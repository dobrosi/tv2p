package org.example.tv2p;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class Tv2pApplication {
    public static void main(String[] args) {
        SpringApplication.run(Tv2pApplication.class, args);
    }
}
