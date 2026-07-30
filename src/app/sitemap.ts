import type { MetadataRoute } from "next";
import { getAllProjectSlugs } from "@/lib/data/projects";
import { getAllBlogSlugs } from "@/lib/data/blog";
import { getSiteUrl } from "@/lib/env";

const SITE_URL = getSiteUrl();

const staticRoutes = [
  "",
  "/about",
  "/services",
  "/portfolio",
  "/case-studies",
  "/clients",
  "/testimonials",
  "/pricing",
  "/booking",
  "/contact",
  "/blog",
  "/faq",
  "/careers",
  "/resources",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const [projectSlugs, blogSlugs] = await Promise.all([
    getAllProjectSlugs(),
    getAllBlogSlugs(),
  ]);

  const projectEntries: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...staticEntries, ...projectEntries, ...blogEntries];
}
