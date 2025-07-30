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
import Posts from "@/payload/collections/Posts";
import Pages from "@/payload/collections/Pages";
import HiddenTags from "@/payload/collections/HiddenTags";

import SiteSettings from "@/payload/globals/SiteSettings";
import NavBar from "@/payload/globals/NavBar";
import Footer from "@/payload/globals/Footer";

if (!process.env.PAYLOAD_SECRET) {
  throw new Error("PAYLOAD_SECRET environment variable is required");
}

if (!process.env.DATABASE_URI) {
  throw new Error("DATABASE_URI environment variable is required");
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
  onInit: createDefaultAdmin,
});

async function createDefaultAdmin(payload: Payload) {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL;
  const adminPassword = process.env.PAYLOAD_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "Environment variables PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD must be set.",
    );
    return;
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

  await payload.create({
    collection: "users",
    data: {
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    },
  });
}
