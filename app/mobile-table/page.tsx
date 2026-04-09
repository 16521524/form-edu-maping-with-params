import type { Metadata } from "next";
import MobileTablePageClient from "@/components/mobile-table/mobile-table-page-client";
import { createMetadata, seoEnv } from "@/lib/seo";

// Force dynamic rendering to avoid 304 responses that can drop Set-Cookie from middleware
export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: seoEnv.mobileTableTitle,
  description: seoEnv.mobileTableDescription,
  image: seoEnv.mobileTableImage,
  path: "/mobile-table",
});

export default function MobileTablePage() {
  return <MobileTablePageClient />;
}
