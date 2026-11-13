/**
 * Tenant configuration file.
 * Encapsulates tenant-specific identifiers, domains, CDN endpoints, and defaults
 * to allow this codebase to be easily reused across different organizations or tenants.
 */

export interface TenantConfig {
  /** Identifier/slug of the tenant */
  id: string;
  /** Display name of the organization / site */
  name: string;
  /** Primary canonical domain of the site */
  domain: string;
  /** Public CDN host for Cloudflare image resizing */
  cdnHost: string;
  /** Default language/locale */
  defaultLocale: string;
  /** Supported locales */
  locales: string[];
}

export const tenantConfig: TenantConfig = {
  id: process.env.NEXT_PUBLIC_TENANT_ID || "da-minh-go-vap",
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Hội dòng Đa Minh Gò Vấp",
  domain: process.env.NEXT_PUBLIC_BASE_URL || "https://dongdaminhgovap.org",
  cdnHost:
    process.env.NEXT_PUBLIC_CDN_HOST || "https://cdn.dongdaminhgovap.org",
  defaultLocale: "vi",
  locales: ["vi", "en"],
};

export default tenantConfig;
