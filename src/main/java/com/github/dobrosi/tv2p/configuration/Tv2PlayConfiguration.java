package com.github.dobrosi.tv2p.configuration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "tv2play")
@Data
@Validated
public class Tv2PlayConfiguration {
    @NotBlank
    @Email
    private String email;

    @NotEmpty
    private char[] password;
}
