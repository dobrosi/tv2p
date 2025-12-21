package com.github.dobrosi.tv2p.model;

import java.io.Serializable;
import java.util.List;

public record SiteRow (
    String title,

    String description,

    String url,

    List<SiteItem> siteItems
) implements Serializable {}