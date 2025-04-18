package com.github.dobrosi.tv2p;

import com.github.dobrosi.configuration.DobrosiApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@DobrosiApplication
@EnableCaching
@EnableScheduling
public class Tv2pApplication {
    public static void main(String[] args) {
        SpringApplication.run(Tv2pApplication.class, args);
    }
}
