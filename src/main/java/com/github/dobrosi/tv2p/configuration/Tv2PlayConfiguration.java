package com.github.dobrosi.tv2p.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "tv2play")
@Data
public class Tv2PlayConfiguration {
    private String email;
    private char[] password;
}
