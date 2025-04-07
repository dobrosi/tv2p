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
import lombok.Data;
import org.example.tv2p.model.Site;
import org.example.tv2p.model.SiteItem;
import org.example.tv2p.model.SiteRow;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Data
@Service
public class Tv2Service {
    public static final String DEFAULT_URL = "https://tv2play.hu";
    public static final String SEARCH_URL = "https://tv2play.hu/kereses?kulcsszo=";
    private static final Pattern backgroundImageUrlPattern = Pattern.compile("background-image:\\s*url\\(\"([^\"]+)\"\\)");

    private static Page page;
    private Site mainSite;

    @Value("${headless:true}")
    private boolean headless;

    {
        init();
    }

    public void init() {
        BrowserContext browser = Playwright.create().chromium().launchPersistentContext(
            Paths.get("playwright-user-data"),
            new BrowserType.LaunchPersistentContextOptions().setHeadless(headless)
        );
        page = browser.newPage();
    }

    public Site loadSite(String url) {
        Site site = buildSite(DEFAULT_URL + (url == null ? "" : url));
        if (url == null || url.isEmpty()) {
            mainSite = site;
        }
        return site;
    }

    public String getVideoUrl(String url) {
        final StringBuffer actualVideoUrl = new StringBuffer();
        page.onRequest(request -> {
            if (actualVideoUrl.isEmpty() && request.url().endsWith(".m3u8")) {
                actualVideoUrl.append(request.url());
            }
        });
        page.navigate("https://tv2play.hu" + url);
        int counter = 0;
        do {
            page.waitForTimeout(500);
        } while (actualVideoUrl.isEmpty() && counter++ < 10);
        page.onRequest(null);
        return actualVideoUrl.toString();
    }

    private Site buildSite(String url) {
        page.navigate(url);
        page.waitForSelector(".eOPCjY");

        scrollDown();

        return new Site(
            page.title(),
            url,
            page.locator(".eOPCjY")
                .all()
                .stream()
                .map(
                    this::getRow
                )
                .toList(),
            null);
    }

    private static void scrollDown() {
        int maxScrolls = 50;
        int delayMs = 500;

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

    private SiteRow getRow(final Locator s) {
        final String title = getTitle(s);
        if (title.toLowerCase().contains("műsorok")) {
            return new SiteRow(title, null, null, getChannelItems(s));
        }
        return new SiteRow(title, null, getShowAllUrl(s), getItems(s));
    }

    private List<SiteItem> getItems(final Locator s) {
        return s.locator("div[width='33.333333333333336']")
            .all()
            .stream()
            .map(this::getItem)
            .toList();
    }

    private List<SiteItem> getChannelItems(final Locator s) {
        return s.locator("div.hgBjaj")
            .all()
            .stream()
            .map(this::getChannelItem)
            .toList();
    }

    private SiteItem getItem(final Locator i) {
        if (!i.textContent().contains("Mutasd")) {
            return new SiteItem(getItemTitle(i), getImageUrl(i, ".fbOoTV"), getUrl(i));
        } else {
            return new SiteItem("Mutasd mindet!", null, getUrl(i));
        }
    }

    private SiteItem getChannelItem(final Locator i) {
        return new SiteItem("", getImageUrl(i, ".bJitzp"), getUrl(i));
    }

    private String getUrl(final Locator i) {
        return i.locator("a.eYVpgd")
            .all()
            .get(0)
            .getAttribute("href");
    }

    private String getImageUrl(final Locator i, String s) {
        Matcher matcher = backgroundImageUrlPattern.matcher(i.locator(s)
                                                                .getAttribute("style"));
        if (matcher.find()) {
            return matcher.group(1);
        } else {
            return null;
        }
    }

    private String getItemTitle(final Locator i) {
        return i.locator(".gXOIAm")
            .textContent();
    }

    private static String getTitle(final Locator s) {
        return s.locator(".emkegV > div:nth-child(1)")
            .textContent();
    }


    private String getShowAllUrl(final Locator s) {
        /*
        final Locator locator = s.locator(".emkegV > div:nth-child(2)");
        return !isEmpty(locator.textContent().trim()) ? locator.locator("a").getAttribute("href") : null;

         */
        return null;
    }

    public Site search(final String text) {
        return buildSite(SEARCH_URL + text);
    }
}
