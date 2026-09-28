/* Woolly Bug site analytics.
 *
 * Page views, referrers and UTM campaigns are counted automatically by Umami.
 * Click events below show up in Umami under "Events".
 *
 * SETUP: paste your Umami website ID between the quotes on the next line.
 */
(function () {
  var UMAMI_ID = "86cf161c-2427-4fd4-a6cc-36640ce8c25d";

  if (UMAMI_ID.indexOf("PASTE") !== 0) {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://cloud.umami.is/script.js";
    s.setAttribute("data-website-id", UMAMI_ID);
    s.setAttribute("data-domains", "woollybug.com,www.woollybug.com"); // local previews aren't counted
    document.head.appendChild(s);
  }

  // Events fired before Umami has loaded are queued, then sent once it's ready.
  var queue = [];
  function flush() {
    if (window.umami && umami.track) { while (queue.length) { var q = queue.shift(); umami.track(q[0], q[1]); } }
    else if (queue.length) setTimeout(flush, 500);
  }
  function track(name, data) {
    queue.push([name, data]); flush();
    if (name === "app_store_click" && window.fbq) fbq("trackCustom", "AppStoreClick", data);
  }

  // Which part of the page a link sits in, so you can see which CTA works.
  function where(el) {
    if (el.closest(".nav")) return "nav";
    if (el.closest(".hero, .hf-hero, .tool-hero")) return "hero";
    if (el.closest(".end-cta, section.cta")) return "closing";
    if (el.closest(".callout, .cta-box")) return "in-article";
    if (el.closest("footer")) return "footer";
    if (el.closest(".card, .tcard")) return "feature-card";
    return "page";
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var info = { location: where(a), page: location.pathname };
    if (href.indexOf("apps.apple.com") > -1) track("app_store_click", info);
    else if (/\/hook-finder\/?$/.test(href)) track("hook_finder_link", info);
    else if (a.classList.contains("post-card")) track("blog_card", { post: href, page: location.pathname });
    else if (href.indexOf("mailto:") === 0) track("contact_click", info);
    else if (/facebook|tiktok|youtube|instagram|reddit/.test(href)) track("social_click", { network: (href.match(/facebook|tiktok|youtube|instagram|reddit/) || [""])[0], page: location.pathname });
  }, true);

  // What Can I Tie? tool: count people who actually use it (once per visit each).
  var used = {};
  function once(name, data) { if (!used[name]) { used[name] = 1; track(name, data); } }
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest(".btn-starter")) once("tool_starter_kit", {});
    else if (e.target.closest(".mat-chip")) once("tool_material_picked", {});
    else if (e.target.closest(".filter-btn")) once("tool_filter_used", {});
  }, true);
})();
