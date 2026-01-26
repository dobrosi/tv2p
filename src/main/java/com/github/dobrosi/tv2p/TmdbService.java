package com.github.dobrosi.tv2p;

import info.movito.themoviedbapi.TmdbApi;
import info.movito.themoviedbapi.model.core.MovieResultsPage;
import info.movito.themoviedbapi.model.movies.MovieDb;
import info.movito.themoviedbapi.tools.TmdbException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TmdbService {
    private final TmdbApi tmdbApi;

    @Autowired
    public TmdbService(final TmdbApi tmdbApi) {
        this.tmdbApi = tmdbApi;
    }

    public MovieResultsPage search(String q) throws TmdbException {
        return tmdbApi.getSearch().searchMovie(q, true, null, null, null, null, null);
    }

    public MovieDb getDetails(int id) throws TmdbException {
        return tmdbApi.getMovies().getDetails(id, null);
    }
}
