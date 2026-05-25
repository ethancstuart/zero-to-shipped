import type { MetadataRoute } from "next";
import { MODULE_METADATA } from "@/lib/content/modules";
import { siteConfig } from "@/lib/constants";
import { ROLE_LANDING_SLUGS } from "@/lib/content/role-landing";

export default function sitemap(): MetadataRoute.Sitemap {
  const modules: MetadataRoute.Sitemap = MODULE_METADATA.map((mod) => ({
    url: `${siteConfig.url}/learn/${mod.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const roleLandings: MetadataRoute.Sitemap = ROLE_LANDING_SLUGS.map(
    (slug) => ({
      url: `${siteConfig.url}/for/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    })
  );

  const libraryPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/learn`, priority: 0.9 },
    { url: `${siteConfig.url}/library`, priority: 0.8 },
    { url: `${siteConfig.url}/library/prompts`, priority: 0.8 },
    { url: `${siteConfig.url}/library/dev-environment`, priority: 0.8 },
    { url: `${siteConfig.url}/library/ai-workflow-os`, priority: 0.8 },
    { url: `${siteConfig.url}/library/claude-md-templates`, priority: 0.8 },
    { url: `${siteConfig.url}/library/builder-tools`, priority: 0.8 },
    { url: `${siteConfig.url}/library/prompt-patterns`, priority: 0.8 },
    { url: `${siteConfig.url}/library/debugging`, priority: 0.8 },
    { url: `${siteConfig.url}/pulse`, priority: 0.8 },
    { url: `${siteConfig.url}/system`, priority: 0.8 },
  ].map((entry) => ({
    ...entry,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/guides/git-101`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/guides/claude-code-101`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/guides/agent-builder`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/system`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}/resources/mcp-plugins`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    { url: `${siteConfig.url}/tools`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/showcase`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${siteConfig.url}/transparency`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.url}/ask`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/build/arena`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/system/observatory`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    ...libraryPages,
    ...roleLandings,
    ...modules,
  ];
}
