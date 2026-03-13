import type { MetadataRoute } from "next";
import { MODULE_METADATA } from "@/lib/content/modules";
import { siteConfig } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const modules: MetadataRoute.Sitemap = MODULE_METADATA.map((mod) => ({
    url: `${siteConfig.url}/modules/${mod.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...modules,
  ];
}
