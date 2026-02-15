package com.github.dobrosi.tv2p;

import com.github.dobrosi.tv2p.configuration.PlaywrigthConfiguration;
import com.github.dobrosi.tv2p.configuration.Tv2PlayConfiguration;
import com.github.dobrosi.tv2p.model.Response;
import com.github.dobrosi.tv2p.model.Site;
import com.github.dobrosi.tv2p.model.SiteItem;
import com.github.dobrosi.tv2p.model.SiteRow;
import com.microsoft.playwright.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jmx.export.annotation.ManagedOperation;
import org.springframework.jmx.export.annotation.ManagedResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static java.lang.System.currentTimeMillis;

@Data
@Service
@ManagedResource(
    objectName="Tv2pBeans:name=Tv2Service",
    description="Tv2Service Bean")
@Slf4j
public class Tv2Service {
    private final PlaywrigthConfiguration playwrigthConfiguration;
    private final Tv2PlayConfiguration tv2PlayConfiguration;

    public static final String DEFAULT_URL = "https://tv2play.hu";
    public static final String SEARCH_URL = "https://tv2play.hu/kereses?kulcsszo=";
    private static Playwright playwright;
    private static Browser browser;
    private static BrowserContext browserContext;

    private long lastAccess;

    @Autowired
    public Tv2Service(
            final PlaywrigthConfiguration playwrigthConfiguration,
            final Tv2PlayConfiguration tv2PlayConfiguration) {
        this.playwrigthConfiguration = playwrigthConfiguration;
        this.tv2PlayConfiguration = tv2PlayConfiguration;
    }

    @PreDestroy
    public void destroy() {
        log.info("destroy");
        close();
    }

    @ManagedOperation
    @CacheEvict(value = {"load", "search", "mainSite"}, allEntries = true)
    @PostConstruct
    public void init() {
        if (playwright == null) {
            playwright = Playwright.create();
            browser = playwright.chromium().launch(
                    new BrowserType.LaunchOptions()
                            .setHeadless(playwrigthConfiguration.isHeadless())
                            .setArgs(List.of(
                                    "--no-sandbox"
                            ))
            );
            browserContext = browser.newContext();
            login();
        }
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
    @Cacheable(value = "videoUrl", key = "#url", unless = "#result == null")
    public Response getVideoUrl(@NonNull String url) {
        log.info("getVideoUrl, url: {}", url);

        AtomicReference<String> actualVideoUrl = new AtomicReference<>();
        actualVideoUrl.set(null);
        try (Page page = getBrowserPage()) {
            page.onRequest(request -> {
                final String videoUrl = request.url();
                if (videoUrl.contains("pstream") && videoUrl.contains("m3u8")) {
                    actualVideoUrl.set(videoUrl);
                }
            });
            page.navigate("https://tv2play.hu" + url);
            int counter = 0;
            do {
                page.waitForTimeout(500);
            } while (actualVideoUrl.get() == null && counter++ < 5);
            final String actualVideoUrlValue = actualVideoUrl.get();
            String res = actualVideoUrlValue == null ? null :
                    actualVideoUrlValue.contains("std") ? actualVideoUrlValue.split("std")[0] + "std/chunklist_b4160000.m3u8" :
                            actualVideoUrlValue;
            actualVideoUrl.set(null);
            log.info("getVideoUrl, response: {}, {}", res, actualVideoUrlValue);
            return new Response(res);
        }
    }

    @Scheduled(cron = "30 * * * * *")
    public void scheduler() {
        if (currentTimeMillis() - lastAccess > 1000 * 60 * 10) { // 10 mins
            //close();
        }
    }

    private Page getBrowserPage() {
        lastAccess = currentTimeMillis();
        return browserContext.newPage();
    }

    private void login() {
        Page browserPage = getBrowserPage();
        browserPage.navigate("https://tv2play.hu");
        browserPage.waitForSelector("#disagree-btn").click();
        browserPage.waitForSelector(".egMsUt").click();
        browserPage.waitForSelector(".gGYsgT").click();
        browserPage.waitForSelector("#email").fill(tv2PlayConfiguration.getEmail());
        browserPage.waitForSelector("#password").fill(new String(tv2PlayConfiguration.getPassword()));
        browserPage.waitForSelector(".hZERXC").click();
        log.info("Login success");
    }

    private Site buildSite(String url) {
        log.info("Create site, url: {}", url);
        try(Page page = getBrowserPage()) {
            page.navigate(url);
            String pageLocator;
            boolean withTitle;

            if (url.contains("/szalag/")) {
                pageLocator = ".hmqeAp";
                withTitle = false;
            } else {
                pageLocator = ".eOPCjY";
                withTitle = true;
            }
            page.waitForSelector(pageLocator);
            scrollDown(page);
            return getSite(page, url, pageLocator, withTitle);
        }
    }

    private Site getSite(Page page, String url, String pageLocator, boolean withTitle) {
        return new Site(
                page.title(),
                url,
                getSiteRows(page, pageLocator, withTitle),
                null);
    }

    private List<SiteRow> getSiteRows(Page page, final String pageLocator, final boolean withTitle) {
        Document doc = Jsoup.parseBodyFragment(page.innerHTML("#root"));
        List<SiteRow> rows = doc.select(pageLocator)
            .stream()
            .map(
                v -> getRow(v, withTitle)
            )
            .toList();
        if (!withTitle && !rows.isEmpty()) {
            rows = splitFirstRowItems(rows.stream().findFirst().orElseThrow().siteItems());
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
            current.siteItems().add(items.get(i));
        }

        return result;
    }

    private void scrollDown(Page page) {
        int maxScrolls = 50;
        int delayMs = 200;

        for (int i = 0; i < maxScrolls; i++) {
            page.evaluate("window.scrollBy(0, window.innerHeight);");
            page.waitForTimeout(delayMs);
            var atBottom = (Boolean) page.evaluate("""
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

    private SiteRow getRow(Element s, boolean withTitle) {
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

    private List<SiteItem> getItems(Element s, String selector) {
        return s.select(selector)
            .stream()
            .map(this::getItem)
            .toList();
    }

    private List<SiteItem> getChannelItems(Element s) {
        return s.select(".hgBjaj")
            .stream()
            .map(this::getChannelItem)
            .toList();
    }

    private SiteItem getItem(Element doc) {
        Element titleElem = doc.selectFirst("h3");
        String title = titleElem != null ? titleElem.text() : "...";

        return new SiteItem(title, getImageUrl(doc), getUrl(doc));
    }

    private SiteItem getChannelItem(Element i) {
        return new SiteItem("", getImageUrl(i), getUrl(i));
    }

    private String getUrl(Element doc) {
        Element link = doc.selectFirst("a.sc-88rx0b-0.eYVpgd");
        return link != null ? link.attr("href") : "";
    }

    private String getImageUrl(Element doc) {
        Element imgDiv = doc.selectFirst("div[style*='background-image']");
        return imgDiv == null ? null : imgDiv.attr("style").replaceAll(".*url\\(\"([^\"]+)\"\\).*", "$1");
    }

    private static String getTitle(Element s) {
        return s.select(".emkegV > div:nth-child(1)").text();
    }

    private String getShowAllUrl(Element s) {
        /*
        final Locator locator = s.locator(".emkegV > div:nth-child(2)");
        return !isEmpty(locator.textContent().trim()) ? locator.locator("a").getAttribute("href") : null;

         */
        return null;
    }

    private void close() {
        close(browserContext);
        close(browser);
        close(playwright);
    }

    private void close(AutoCloseable o) {
        try {
            log.info("closed: {}", o);
            o.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
