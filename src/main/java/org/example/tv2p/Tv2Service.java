package org.example.tv2p;

import java.nio.file.Paths;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.example.tv2p.model.Site;
import org.example.tv2p.model.SiteItem;
import org.example.tv2p.model.SiteRow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
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

    @PostConstruct
    public void init() {
        if (browser == null) {
            browser = Playwright.create()
                .chromium()
                .launchPersistentContext(
                    Paths.get("playwright-user-data"),
                    new BrowserType.LaunchPersistentContextOptions().setHeadless(headless)
                );
            internalPage = browser.newPage();
        }
    }

    public void close() {
        if (browser != null) {
            internalPage.close();
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
        return actualVideoUrl.toString();
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
            init();
        }
        return internalPage;
    }

    private Site buildSite(String url) {
        getPage().navigate(url);
        String pageLocator;
        boolean withTitle;

        if (url.contains("/szalag/")) {
            pageLocator = ".gCSbay";
            withTitle = false;
        } else {
            pageLocator = ".eOPCjY";
            withTitle = true;
        }

        getPage().waitForSelector(pageLocator);

        scrollDown();

        return getSite(url, pageLocator, withTitle);
    }

    private Site getSite(String url, String pageLocator, boolean withTitle) {
        return new Site(
            getPage().title(),
            url,
            getPage().locator(pageLocator)
                .all()
                .stream()
                .map(
                    v -> getRow(v, withTitle)
                )
                .toList(),
            null);
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
        }
        return new SiteRow(title, null, getShowAllUrl(s), getItems(s));
    }

    private List<SiteItem> getItems(Locator s) {
        return s.locator(".hgBjaj")
            .all()
            .stream()
            .map(this::getItem)
            .toList();
    }

    private List<SiteItem> getChannelItems(Locator s) {
        return s.locator("div.hgBjaj")
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

    public void clearCache() {
        cacheManager.getCacheNames()
            .parallelStream()
            .forEach(n -> cacheManager.getCache(n).clear());
    }
}
