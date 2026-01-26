package com.github.dobrosi.tv2p.controller;

import java.util.List;

import com.github.dobrosi.tv2p.TmdbService;
import com.github.dobrosi.tv2p.model.Response;
import com.github.dobrosi.tv2p.model.Site;
import com.github.dobrosi.tv2p.model.SiteItem;
import com.github.dobrosi.tv2p.model.SiteRow;
import info.movito.themoviedbapi.model.core.Movie;
import info.movito.themoviedbapi.model.movies.MovieDb;
import info.movito.themoviedbapi.tools.TmdbException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Collections.emptyList;

@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/tmdb/api")
public class TmdbController {
    private final TmdbService tmdbService;

    @Autowired
    public TmdbController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/load")
    public Site loadSite() {
        return new Site(null, null, emptyList(), null);
    }

    @GetMapping("/search")
    public Site search(@RequestParam String text) throws TmdbException {
        return new Site(
                text,
                null,
                List.of(new SiteRow(
                        text,
                        null,
                        null,
                        tmdbService.search(text)
                                .getResults()
                                .stream()

                                .map(
                                        m -> new SiteItem(getTitle(m), getPoster(m), getUrl(m)))
                                .toList())),
                null);
    }

    @GetMapping("/getVideoUrl")
    public Response getVideoUrl(@RequestParam("url") String id) {
        return new Response("https://pgy.no-ip.hu/ncrplyr/play/" + getDetails(Integer.parseInt(id)).getImdbID());
    }


    private MovieDb getDetails(int id) {
        try {
            return tmdbService.getDetails(id);
        } catch (TmdbException e) {
            throw new RuntimeException(e);
        }
    }

    private String getTitle(Movie movie) {
        return String.format("%s - %s - %s" , movie.getTitle(), movie.getReleaseDate().split("-")[0], movie.getOverview());
    }

    private String getPoster(Movie movie) {
        return "https://image.tmdb.org/t/p/original/" + movie.getPosterPath();
    }

    private String getUrl(Movie movie) {
        return "" + movie.getId();
    }
}
