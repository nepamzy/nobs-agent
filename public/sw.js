const CACHE_NAME = "nobs-agent-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/icon-192.png", "/logo-mark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Handles an incoming Web Push message and shows an OS-level notification,
// this is what makes it appear "like WhatsApp" even when the site/app
// isn't open. The payload is JSON set by src/lib/push.ts on the server.
self.addEventListener("push", (event) => {
  let data = { title: "NOBS AGENT", body: "You have a new notification.", url: "/admin" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // fall back to defaults above
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url },
    })
  );
});

// Tapping the notification focuses an existing tab if one's open, or
// opens a new one at the relevant link (e.g. the booking or inbox item).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API routes, auth, or admin/dashboard, this content
  // must always be live, caching it would risk showing stale payment
  // status, stale messages, or a stale auth state.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dashboard")
  ) {
    return;
  }

  // Page navigations: always try the network first so content is never
  // stale, only fall back to the offline page if the network genuinely
  // fails.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Static assets (images, fonts, icons): cache-first, these rarely
  // change and benefit from instant repeat loads.
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
  }
});
