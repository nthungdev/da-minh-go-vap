import path from "node:path";
import { fileURLToPath } from "node:url";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { en } from "@payloadcms/translations/languages/en";
import { vi } from "@payloadcms/translations/languages/vi";
import { buildConfig, type Payload } from "payload";
import sharp from "sharp";
import { defaultLocale, localeLabels, locales } from "@/i18n/config";
import HiddenTags from "@/payload/collections/HiddenTags";
import Media from "@/payload/collections/Media";
import Pages from "@/payload/collections/pages";
import Posts from "@/payload/collections/posts";
import SearchTags from "@/payload/collections/search-tags";
import SpotifyPodcasts from "@/payload/collections/spotify-podcasts";
import Users from "@/payload/collections/Users";
import Footer from "@/payload/globals/Footer";
import NavBar from "@/payload/globals/NavBar";
import SiteSettings from "@/payload/globals/site-settings";

if (!process.env.PAYLOAD_SECRET) {
  throw new Error("PAYLOAD_SECRET environment variable is required");
}

if (!process.env.DATABASE_URI) {
  throw new Error("DATABASE_URI environment variable is required");
}

if (!process.env.PAYLOAD_ADMIN_EMAIL) {
  throw new Error("PAYLOAD_ADMIN_EMAIL environment variable is required");
}

if (!process.env.PAYLOAD_ADMIN_PASSWORD) {
  throw new Error("PAYLOAD_ADMIN_PASSWORD environment variable is required");
}

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    HiddenTags,
    SearchTags,
    Media,
    Pages,
    Posts,
    Users,
    SpotifyPodcasts,
  ],
  globals: [NavBar, Footer, SiteSettings],
  i18n: {
    supportedLanguages: { en, vi },
  },
  localization: {
    locales: locales.map((locale) => ({
      code: locale,
      label: localeLabels[locale],
    })),
    defaultLocale,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    connectOptions: {
      maxPoolSize: 10,
      minPoolSize: 1,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true, // Apply storage to 'media' collection
      },
      bucket: process.env.S3_BUCKET || "",
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.S3_SECRET || "",
        },
        region: "auto", // Cloudflare R2 uses 'auto' as the region
        endpoint: process.env.S3_ENDPOINT || "",
      },
    }),
  ],
  upload: {
    abortOnLimit: true,
    responseOnLimit: "File không được vượt quá 100MB.",
    limits: {
      // Make sure to also update the client_max_body_size in nginx.conf if you change this
      fileSize: 100 * 1024 * 1024, // 100 MB
    },
  },
  onInit: createDefaultAdmin,
});

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("data" in error)) {
    return false;
  }
  const data = (error as { data?: { errors?: unknown } }).data;
  if (!Array.isArray(data?.errors)) {
    return false;
  }
  return data.errors.some(
    (entry): boolean =>
      typeof entry === "object" &&
      entry !== null &&
      "message" in entry &&
      typeof entry.message === "string" &&
      entry.message.includes("Value must be unique"),
  );
}

async function createDefaultAdmin(payload: Payload) {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL;
  const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD;

  if (!(adminEmail && adminPassword)) {
    throw new Error(
      "PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD environment variables are required",
    );
  }

  const admins = await payload.find({
    collection: "users",
    where: {
      email: {
        equals: adminEmail,
      },
    },
  });
  const hasAdminUser = admins.docs.length > 0;

  if (hasAdminUser) return;

  console.log("Creating default admin user...");

  try {
    await payload.create({
      collection: "users",
      data: {
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating default admin user:", error.message);
    } else if (isUniqueConstraintError(error)) {
      console.warn(
        "Admin user already exists from a race condition, skipping creation.",
      );
    }
  }

  console.log("Default admin user created");
}
