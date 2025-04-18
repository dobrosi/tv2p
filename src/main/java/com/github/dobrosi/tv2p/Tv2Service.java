package com.github.dobrosi.tv2p;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import lombok.Data;
import com.github.dobrosi.tv2p.model.Site;
import com.github.dobrosi.tv2p.model.SiteItem;
import com.github.dobrosi.tv2p.model.SiteRow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Data
@Service
public class Tv2Service {
    @Value("${headless:true}")
    private boolean headless;

    @Autowired
    private CacheManager cacheManager;

    public static final String DEFAULT_URL = "https://tv2play.hu";
    public static final String SEARCH_URL = "https://tv2play.hu/kereses?kulcsszo=";
    private static final Pattern backgroundImageUrlPattern = Pattern.compile("background-image:\\s*url\\(\"([^\"]+)\"\\)");

    private static Page internalPage;
    private BrowserContext browser;
    private Site mainSite;
    private long lastAccess;

    @CacheEvict(value = {"load", "search", "mainSite"}, allEntries = true)
    public void init() {
    }

    public void close() {
        if (browser != null) {
            browser.close();
        }
        internalPage = null;
        browser = null;
    }

    public Site loadSite(String url) {
        Site site = buildSite(DEFAULT_URL + (url == null ? "" : url));
        if (url == null || url.isEmpty()) {
            mainSite = site;
        }
        return site;
    }

    public Site search(String text) {
        return buildSite(SEARCH_URL + text);
    }

    public String getVideoUrl(String url) {
        final StringBuffer actualVideoUrl = new StringBuffer();
        getPage().onRequest(request -> {
            if (actualVideoUrl.isEmpty() && request.url().endsWith(".m3u8")) {
                actualVideoUrl.append(request.url());
            }
        });
        getPage().navigate("https://tv2play.hu" + url);
        int counter = 0;
        do {
            getPage().waitForTimeout(500);
        } while (actualVideoUrl.isEmpty() && counter++ < 10);
        getPage().onRequest(null);
        String res = actualVideoUrl.toString();
        close();
        return res;
    }

    @Scheduled(cron = "30 * * * * *")
    public void scheduler() {
        if (System.currentTimeMillis() - lastAccess > 1000 * 60 * 10) { // 10 mins
            close();
        }
    }

    private Page getPage() {
        lastAccess = System.currentTimeMillis();
        if (internalPage == null) {
            browser = Playwright.create()
                .chromium()
                .launchPersistentContext(
                    Paths.get("playwright-user-data"),
                    new BrowserType.LaunchPersistentContextOptions().setHeadless(headless)
                );
            internalPage = browser.newPage();
        }
        return internalPage;
    }

    private Site buildSite(String url) {
        getPage().navigate(url);
        String pageLocator;
        boolean withTitle;

        if (url.contains("/szalag/")) {
            pageLocator = ".hmqeAp";
            withTitle = false;
        } else {
            pageLocator = ".eOPCjY";
            withTitle = true;
        }

        getPage().waitForSelector(pageLocator);

        scrollDown();

        final Site site = getSite(url, pageLocator, withTitle);
        close();
        return site;
    }

    private Site getSite(String url, String pageLocator, boolean withTitle) {
        return new Site(
            getPage().title(),
            url,
            getSiteRows(pageLocator, withTitle),
            null);
    }

    private List<SiteRow> getSiteRows(final String pageLocator, final boolean withTitle) {
        List<SiteRow> rows = getPage().locator(pageLocator)
            .all()
            .stream()
            .map(
                v -> getRow(v, withTitle)
            )
            .toList();
        if (!withTitle) {
            final SiteRow firstRow = rows.get(0);
            rows = new ArrayList<>();
            int i = 0;
            SiteRow nextRow = null;
            for (SiteItem item : firstRow.getSiteItems()) {
                if (i++ % 4 == 0) {
                    rows.add(nextRow = new SiteRow(null, null, null, new ArrayList<>()));
                }
                nextRow.getSiteItems().add(item);
            }
        }
        return rows;
    }

    private void scrollDown() {
        int maxScrolls = 50;
        int delayMs = 500;

        for (int i = 0; i < maxScrolls; i++) {
            getPage().evaluate("window.scrollBy(0, window.innerHeight);");
            getPage().waitForTimeout(delayMs);
            var atBottom = (Boolean) getPage().evaluate("""
                    () => {
                        const scrollTop = window.scrollY || document.documentElement.scrollTop;
                        const clientHeight = document.documentElement.clientHeight;
                        const scrollHeight = document.documentElement.scrollHeight;
                        return Math.ceil(scrollTop + clientHeight) >= scrollHeight;
                    }
                """);

            if (atBottom) {
                break;
            }
        }
    }

    private SiteRow getRow(Locator s, boolean withTitle) {
        String title = "";
        if (withTitle) {
            title = getTitle(s);
            if (title.toLowerCase()
                .contains("műsorok")) {
                return new SiteRow(title, null, null, getChannelItems(s));
            }
        } else {
            return new SiteRow(title, null, getShowAllUrl(s), getItems(s, ".hpkJli"));
        }
        return new SiteRow(title, null, getShowAllUrl(s), getItems(s, ".jyYozc"));
    }

    private List<SiteItem> getItems(Locator s, String selector) {
        return s.locator(selector)
            .all()
            .stream()
            .map(this::getItem)
            .toList();
    }

    private List<SiteItem> getChannelItems(Locator s) {
        return s.locator(".hgBjaj")
            .all()
            .stream()
            .map(this::getChannelItem)
            .toList();
    }

    private SiteItem getItem(Locator i) {
        if (!i.textContent().contains("Mutasd")) {
            return new SiteItem(getItemTitle(i), getImageUrl(i, ".fbOoTV"), getUrl(i));
        } else {
            return new SiteItem("Mutasd mindet!", null, getUrl(i));
        }
    }

    private SiteItem getChannelItem(Locator i) {
        return new SiteItem("", getImageUrl(i, ".bJitzp"), getUrl(i));
    }

    private String getUrl(Locator i) {
        return i.locator("a.eYVpgd")
            .all()
            .get(0)
            .getAttribute("href");
    }

    private String getImageUrl(Locator i, String s) {
        Matcher matcher = backgroundImageUrlPattern.matcher(i.locator(s)
                                                                .getAttribute("style"));
        if (matcher.find()) {
            return matcher.group(1);
        } else {
            return null;
        }
    }

    private String getItemTitle(Locator i) {
        return i.locator(".gXOIAm")
            .textContent();
    }

    private static String getTitle(Locator s) {
        return s.locator(".emkegV > div:nth-child(1)")
            .textContent();
    }

    private String getShowAllUrl(Locator s) {
        /*
        final Locator locator = s.locator(".emkegV > div:nth-child(2)");
        return !isEmpty(locator.textContent().trim()) ? locator.locator("a").getAttribute("href") : null;

         */
        return null;
    }
}
