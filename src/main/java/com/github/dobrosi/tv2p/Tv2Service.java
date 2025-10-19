package com.github.dobrosi.tv2p;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.github.dobrosi.tv2p.configuration.PlaywrigthConfiguration;
import com.github.dobrosi.tv2p.model.Site;
import com.github.dobrosi.tv2p.model.SiteItem;
import com.github.dobrosi.tv2p.model.SiteRow;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import jakarta.annotation.PreDestroy;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedResource;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import static com.microsoft.playwright.Playwright.create;
import static java.lang.System.currentTimeMillis;

@Data
@Service
@ManagedResource(
    objectName="Tv2pBeans:name=Tv2Service",
    description="Tv2Service Bean")
@Slf4j
public class Tv2Service {
    private final CacheManager cacheManager;
    private final PlaywrigthConfiguration playwrigthConfiguration;

    public static final String DEFAULT_URL = "https://tv2play.hu";
    public static final String SEARCH_URL = "https://tv2play.hu/kereses?kulcsszo=";
    private static final Pattern backgroundImageUrlPattern = Pattern.compile("background-image:\\s*url\\(\"([^\"]+)\"\\)");

    private static Page browserPage;
    private BrowserContext browser;
    private long lastAccess;

    @Autowired
    public Tv2Service(final CacheManager cacheManager, final PlaywrigthConfiguration playwrigthConfiguration) {
        this.cacheManager = cacheManager;
        this.playwrigthConfiguration = playwrigthConfiguration;
    }

    @PreDestroy
    public void destroy() {
        log.info("destroy");
        close();
    }

    @ManagedOperation
    @CacheEvict(value = {"load", "search", "mainSite"}, allEntries = true)
    public void init() {
    }

    @ManagedOperation
    @CacheEvict(value = {"videoUrl"}, allEntries = true)
    public void initVideoUrls() {
    }

    @Cacheable(value = "load", key = "#url == null ? '' : #url")
    @ManagedOperation
    public Site loadSite(String url) {
        return buildSite(DEFAULT_URL + (url == null ? "" : url));
    }

    @Cacheable(value = "search", key = "#text")
    @ManagedOperation
    public Site search(String text) {
        return buildSite(SEARCH_URL + text);
    }

    @ManagedOperation
    @Cacheable(value = "videoUrl", key = "#url")
    public String getVideoUrl(@NonNull String url) {
        log.info("getVideoUrl, url: {}", url);
        List<String> actualVideoUrls = new ArrayList<>();
        getBrowserPage().onRequest(request -> {
            final String videoUrl = request.url();
            if (videoUrl.contains("chunk") && videoUrl.endsWith(".m3u8")) {
                actualVideoUrls.add(videoUrl);
            }
        });
        getBrowserPage().navigate("https://tv2play.hu" + url);
        int counter = 0;
        do {
            getBrowserPage().waitForTimeout(500);
        } while (actualVideoUrls.size() < 3 && counter++ < 10);
 //       getPage().onRequest(null);

        String res = getActualVideoUrl(actualVideoUrls);
        log.info("getVideoUrl, response: {}", res);
        return res;
    }

    private String getActualVideoUrl(List<String> urls) {
        return urls.isEmpty() ? null : urls.get(urls.size() == 1 ? 0 : 1);
    }

    @Scheduled(cron = "30 * * * * *")
    public void scheduler() {
        if (currentTimeMillis() - lastAccess > 1000 * 60 * 10) { // 10 mins
            close();
        }
    }

    private synchronized Page getBrowserPage() {
        lastAccess = currentTimeMillis();
        if (browserPage == null || browserPage.isClosed()) {
            browser = create()
                .firefox()
                .launchPersistentContext(
                    Paths.get("playwright-user-data"),
                    new BrowserType
                            .LaunchPersistentContextOptions()
                            .setHeadless(playwrigthConfiguration
                                                 .isHeadless())
                );
            browserPage = browser.pages().stream().findFirst().orElseThrow();
        }
        return browserPage;
    }

    private Site buildSite(String url) {
        log.info("Create site, url: {}", url);
        getBrowserPage().navigate(url);
        String pageLocator;
        boolean withTitle;

        if (url.contains("/szalag/")) {
            pageLocator = ".hmqeAp";
            withTitle = false;
        } else {
            pageLocator = ".eOPCjY";
            withTitle = true;
        }
        getBrowserPage().waitForSelector(pageLocator);
        scrollDown();
        return getSite(url, pageLocator, withTitle);
    }

    private Site getSite(String url, String pageLocator, boolean withTitle) {
        return new Site(
                getBrowserPage().title(),
                url,
                getSiteRows(pageLocator, withTitle),
                null);
    }

    private List<SiteRow> getSiteRows(final String pageLocator, final boolean withTitle) {
        List<SiteRow> rows = getBrowserPage().locator(pageLocator)
            .all()
            .stream()
            .map(
                v -> getRow(v, withTitle)
            )
            .toList();
        if (!withTitle && !rows.isEmpty()) {
            rows = splitFirstRowItems(rows.stream().findFirst().orElseThrow().getSiteItems());
        }

        return rows;
    }

    private List<SiteRow> splitFirstRowItems(List<SiteItem> items) {
        List<SiteRow> result = new ArrayList<>();
        SiteRow current = null;

        for (int i = 0; i < items.size(); i++) {
            if (i % 4 == 0) {
                current = new SiteRow(null, null, null, new ArrayList<>());
                result.add(current);
            }
            current.getSiteItems().add(items.get(i));
        }

        return result;
    }

    private void scrollDown() {
        int maxScrolls = 50;
        int delayMs = 200;

        for (int i = 0; i < maxScrolls; i++) {
            getBrowserPage().evaluate("window.scrollBy(0, window.innerHeight);");
            getBrowserPage().waitForTimeout(delayMs);
            var atBottom = (Boolean) getBrowserPage().evaluate("""
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
            log.info("Create row, title: {}", title);
            if (title.toLowerCase()
                .contains("műsorok")) {
                return new SiteRow(title, null, null, getChannelItems(s));
            }
        } else {
            log.info("Create row");
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
        final String itemTitle;
        final String imageUrl;
        final String url = getUrl(i);
        if (!i.textContent().contains("Mutasd")) {
            itemTitle = getItemTitle(i);
            imageUrl = getImageUrl(i, ".fbOoTV");
        } else {
            itemTitle = "Mutasd mindet!";
            imageUrl = null;
        }
        log.info("Create item, title: {}", itemTitle);
        return new SiteItem(itemTitle, imageUrl, url);
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
        log.info("getShowAllUrl, {}", s);
        /*
        final Locator locator = s.locator(".emkegV > div:nth-child(2)");
        return !isEmpty(locator.textContent().trim()) ? locator.locator("a").getAttribute("href") : null;

         */
        return null;
    }

    private void close() {
        if (browserPage != null) {
            log.info("browserPage close");
            browserPage.close();
            browserPage = null;
        }
        if (browser != null) {
            log.info("browser close");
            browser.close();
            browser = null;
        }
    }
}
