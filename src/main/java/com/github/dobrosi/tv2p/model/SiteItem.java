package com.github.dobrosi.tv2p.model;

import java.io.Serializable;

public record SiteItem(
        String title,
        String imageUrl,
        String url
) implements Serializable {}
