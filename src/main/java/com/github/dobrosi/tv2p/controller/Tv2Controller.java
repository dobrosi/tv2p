package com.github.dobrosi.tv2p.controller;

import java.io.Serializable;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.github.dobrosi.tv2p.Tv2Service;
import com.github.dobrosi.tv2p.model.Site;
import com.github.dobrosi.tv2p.model.SiteItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class Tv2Controller {
    final Tv2Service tv2Service;

    @Autowired
    public Tv2Controller(final Tv2Service tv2Service) {
        this.tv2Service = tv2Service;
    }

    @GetMapping("/init")
    public void init() {
        tv2Service.init();
    }

    @GetMapping("/initVideoUrls")
    public void initFull() {
        tv2Service.initVideoUrls();
    }

    @GetMapping("/load")
    public Site loadSite(
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "init", required = false) boolean init) {
        if (init) {
            tv2Service.init();
        }
        return tv2Service.loadSite(url);
    }

    @GetMapping("/search")
    public Site search(@RequestParam(value = "text") String text ) {
        return tv2Service.search(text);
    }

    @GetMapping("/getVideoUrl")
    public Response getVideoUrl(@RequestParam("url") String url) {
        return new Response(tv2Service.getVideoUrl(url));
    }

    @GetMapping("/getVideoUrls")
    public List<Response> getVideoUrls(@RequestParam("rowLimit") int rowLimit) {
        return loadSite(null, false)
                .siteRows()
                .stream()
                .limit(rowLimit)
                .flatMap(row -> row.siteItems().stream())
                .map(SiteItem::url)
                .filter(Objects::nonNull)
                .map(this::getVideoUrl)
                .collect(Collectors.toList());
    }

    @Data
    @AllArgsConstructor
    public static class Response implements Serializable {
        Object value;
    }
}
