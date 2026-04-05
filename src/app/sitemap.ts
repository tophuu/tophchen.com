import type { MetadataRoute } from "next";
import { lastEditedDate } from "../data/notes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://tophchen.com",
      lastModified: lastEditedDate,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
