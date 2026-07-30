import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/api", "/login"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
