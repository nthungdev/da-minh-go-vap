// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig, Payload } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { en } from "@payloadcms/translations/languages/en";
import { vi } from "@payloadcms/translations/languages/vi";

import Users from "@/payload/collections/Users";
import Media from "@/payload/collections/Media";
import Posts from "@/payload/collections/posts";
import Pages from "@/payload/collections/pages";
import HiddenTags from "@/payload/collections/HiddenTags";

import SiteSettings from "@/payload/globals/SiteSettings";
import NavBar from "@/payload/globals/NavBar";
import Footer from "@/payload/globals/Footer";
import { defaultLocale, localeLabels, locales } from "@/i18n/config";

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
  collections: [HiddenTags, Media, Pages, Posts, Users],
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
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  upload: {
    abortOnLimit: true,
    responseOnLimit: "File không được vượt quá 10MB.",
    limits: {
      // Make sure to also update the client_max_body_size in nginx.conf if you change this
      fileSize: 100 * 1024 * 1024, // 100 MB
    },
  },
  onInit: createDefaultAdmin,
});

async function createDefaultAdmin(payload: Payload) {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL!;
  const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD!;

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

  await payload.create({
    collection: "users",
    data: {
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    },
  });

  console.log("Default admin user created");
}
