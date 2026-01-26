package com.github.dobrosi.tv2p;

import info.movito.themoviedbapi.model.core.image.Artwork;
import info.movito.themoviedbapi.tools.TmdbException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TmdbServiceTest {
    @Autowired TmdbService tmdbService;

    @Test
    void searchMovie() throws TmdbException {
        tmdbService.search("Paris Texas");

        for (final Artwork poster : tmdbService.getDetails(655)
                .getImages()
                .getPosters()) {
            System.out.println(poster.getFilePath());

        }
    }
}