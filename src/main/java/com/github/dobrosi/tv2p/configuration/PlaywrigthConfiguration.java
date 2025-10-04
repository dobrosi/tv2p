package com.github.dobrosi.tv2p.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "playwright")
@Data
public class PlaywrigthConfiguration {
    private boolean headless;
}
