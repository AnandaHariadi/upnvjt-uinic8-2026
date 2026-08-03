/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev,
  // Web Push handlers (push + notificationclick) live in public/sw-push.js.
  importScripts: ["/sw-push.js"],
  // Keep the large hero video out of the service-worker precache.
  publicExcludes: ["!noprecache/**/*", "!media/**/*"],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "osm-tiles", expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "next-static", expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "next-image", expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 } },
    },
    {
      // Workbox matches RegExps against the full URL, so use a function for path checks.
      urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.startsWith("/dashboard"),
      handler: "NetworkFirst",
      options: { cacheName: "dashboard-pages", networkTimeoutSeconds: 5, expiration: { maxEntries: 20, maxAgeSeconds: 24 * 60 * 60 } },
    },
  ],
});

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : "";
  } catch {
    return "";
  }
})();

const csp = [
  "default-src 'self'",
  // Next.js needs inline scripts for hydration; eval only in development (React Refresh).
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
  `connect-src 'self' https://*.tile.openstreetmap.org${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera is needed for evidence capture; geolocation is optional and permission-based.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self), payment=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
