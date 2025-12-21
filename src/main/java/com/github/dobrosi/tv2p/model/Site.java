package com.github.dobrosi.tv2p.model;

import java.io.Serializable;
import java.util.List;

public record Site (
    String title,

    String url,

    List<SiteRow> siteRows,

    Site nextToMore
) implements Serializable {}
