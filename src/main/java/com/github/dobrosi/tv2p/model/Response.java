package com.github.dobrosi.tv2p.model;

import java.io.Serializable;

public record Response(
    Object value
) implements Serializable {}
