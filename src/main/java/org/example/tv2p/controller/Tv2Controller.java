package org.example.tv2p.controller;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.tv2p.Tv2Service;
import org.example.tv2p.model.Site;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/tv2")
public class Tv2Controller {
    @Autowired
    Tv2Service tv2Service;

    @GetMapping("/inint")
    public void init() {
        tv2Service.init();
    }

    @GetMapping("/get")
    public Site getMainSite() {
        return tv2Service.getMainSite();
    }

    @GetMapping("/load")
    public Site loadSite(@RequestParam(value = "url", required = false) String url ) {
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

    @Data
    @AllArgsConstructor
    public static class Response {
        String value;
    }
}
