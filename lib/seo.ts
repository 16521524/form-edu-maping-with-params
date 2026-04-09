import type { Metadata } from "next";

type SeoInput = {
  title?: string;
  description?: string;
  image?: string;
  icon?: string;
  path?: string;
};

function readEnv(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function getMetadataBase() {
  const siteUrl = readEnv(process.env.NEXT_PUBLIC_SITE_URL);

  if (!siteUrl) {
    return undefined;
  }

  try {
    return new URL(siteUrl);
  } catch {
    return undefined;
  }
}

function getCanonicalUrl(path?: string) {
  const metadataBase = getMetadataBase();

  if (!metadataBase || !path) {
    return undefined;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return new URL(normalizedPath, metadataBase).toString();
  } catch {
    return undefined;
  }
}

const fallbackSiteName = "Đại học Gia Định";
const fallbackAsset =
  "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png";
const envSiteName = readEnv(process.env.NEXT_PUBLIC_SEO_SITE_NAME);
const envDefaultTitle = readEnv(process.env.NEXT_PUBLIC_SEO_DEFAULT_TITLE);
const envDefaultDescription = readEnv(
  process.env.NEXT_PUBLIC_SEO_DEFAULT_DESCRIPTION,
);
const envDefaultImage = readEnv(process.env.NEXT_PUBLIC_SEO_DEFAULT_IMAGE);
const envDefaultIcon = readEnv(process.env.NEXT_PUBLIC_SEO_DEFAULT_ICON);
const resolvedSiteName = envSiteName ?? fallbackSiteName;
const resolvedDefaultTitle = envDefaultTitle ?? resolvedSiteName;
const resolvedDefaultDescription =
  envDefaultDescription ?? resolvedDefaultTitle;
const resolvedDefaultImage = envDefaultImage ?? envDefaultIcon ?? fallbackAsset;
const resolvedDefaultIcon = envDefaultIcon ?? resolvedDefaultImage;

export const seoEnv = {
  siteName: resolvedSiteName,
  defaultTitle: resolvedDefaultTitle,
  defaultDescription: resolvedDefaultDescription,
  defaultImage: resolvedDefaultImage,
  defaultIcon: resolvedDefaultIcon,
  generator: readEnv(process.env.NEXT_PUBLIC_SEO_GENERATOR) ?? "Edu",
  mobileTableTitle:
    readEnv(process.env.NEXT_PUBLIC_SEO_MOBILE_TABLE_TITLE) ??
    resolvedDefaultTitle,
  mobileTableDescription:
    readEnv(process.env.NEXT_PUBLIC_SEO_MOBILE_TABLE_DESCRIPTION) ??
    resolvedDefaultDescription,
  mobileTableImage:
    readEnv(process.env.NEXT_PUBLIC_SEO_MOBILE_TABLE_IMAGE) ??
    resolvedDefaultImage,
};

export function createMetadata({
  title,
  description,
  image,
  icon,
  path,
}: SeoInput = {}): Metadata {
  const metadataBase = getMetadataBase();
  const resolvedTitle = title ?? seoEnv.defaultTitle;
  const resolvedDescription = description ?? seoEnv.defaultDescription;
  const resolvedImage = image ?? seoEnv.defaultImage;
  const resolvedIcon = icon ?? seoEnv.defaultIcon;
  const canonicalUrl = getCanonicalUrl(path);

  return {
    metadataBase,
    title: resolvedTitle,
    description: resolvedDescription,
    applicationName: seoEnv.siteName,
    alternates: canonicalUrl
      ? {
          canonical: canonicalUrl,
        }
      : undefined,
    icons: resolvedIcon
      ? {
          icon: resolvedIcon,
          shortcut: resolvedIcon,
          apple: resolvedIcon,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: seoEnv.siteName,
      title: resolvedTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
    generator: seoEnv.generator,
  };
}
